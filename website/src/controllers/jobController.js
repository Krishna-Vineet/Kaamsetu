import {Job} from '../models/jobModel.js';
import {Log} from '../models/logModel.js';
import { v2 as cloudinary } from '../utils/cloudinary.js';

export const handlePostJob = async (req, res) => {
  try {
    const { clientId } = req.params;
    const files = req.files;

    // Authorization check
    if (req.user.role !== 'client' || req.user.id !== clientId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    const requiredFields = [
      'jobTitle', 'jobDescription', 'category',
      'location', 'startDate', 'price'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Upload media files to Cloudinary
    const media = [];
    for (let i = 1; i <= 5; i++) {
      const file = files[`media${i}`]?.[0];
      if (file) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image'
          });
          media.push({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type
          });
        } catch (uploadError) {
          console.error(`Error uploading media${i}:`, uploadError);
          return res.status(500).json({
            error: `Failed to upload media file ${i}`
          });
        }
      }
    }

    // Create new job
    const newJob = await Job.create({
      title: req.body.jobTitle,
      description: req.body.jobDescription,
      location: req.body.location,
      category: req.body.category,
      subCategory: req.body.subCategory || '',
      media: media,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      budget: Number(req.body.price),
      client: clientId,
      status: 'awaitingSelection'
    });

    // Create log entry
    await Log.create({
      title: 'New Job Posted',
      description: `Client ${req.user.name} posted: ${req.body.jobTitle}`,
      link: `/manage-job/${clientId}/jobs/${newJob._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      jobId: newJob._id,
      mediaUrls: media.map(m => m.url)
    });

  } catch (error) {
    console.error('Error creating job:', error);
    
    // Cleanup uploaded files if error occurs
    if (media && media.length > 0) {
      await Promise.all(
        media.map(file => 
          cloudinary.uploader.destroy(file.public_id)
        )
      );
    }

    res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
};
// export const handlePostJob = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const files = req.files;

//     // Authorization check
//     if (req.user.role !== 'client' || req.user.id !== clientId) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     // Validate required fields
//     const requiredFields = [
//       'jobTitle', 'jobDescription', 'category',
//       'location', 'startDate', 'price'
//     ];
    
//     const missingFields = requiredFields.filter(field => !req.body[field]);
//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         error: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Process media files
//     const media = [];
//     for (let i = 1; i <= 5; i++) {
//       if (files[`media${i}`]?.[0]) {
//         media.push(`/uploads/${files[`media${i}`][0].filename}`);
//       }
//     }

//     // Create new job
//     const newJob = await Job.create({
//       title: req.body.jobTitle,
//       description: req.body.jobDescription,
//       location: req.body.location,
//       category: req.body.category,
//       subCategory: req.body.subCategory || '',
//       media: media,
//       startDate: new Date(req.body.startDate),
//       endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
//       budget: Number(req.body.price),
//       client: clientId,
//       status: 'awaitingSelection'
//     });

//     // Create log entry
//     await Log.create({
//       title: 'New Job Posted',
//       description: `Client ${req.user.name} posted: ${req.body.jobTitle}`,
//       link: `/manage-job/${clientId}/jobs/${newJob._id}`
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Job posted successfully',
//       jobId: newJob._id
//     });

//   } catch (error) {
//     console.error('Error creating job:', error);
//     res.status(500).json({
//       error: error.message || 'Internal Server Error'
//     });
//   }
// };