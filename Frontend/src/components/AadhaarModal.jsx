import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function AadhaarModal({ isOpen, onClose, onVerify, isVerifying, verificationStatus }) {
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please upload a valid image (JPG, PNG) or PDF file')
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (aadhaarNumber.length === 12 && file) {
      onVerify(aadhaarNumber, file)
    }
  }

  const handleClose = () => {
    setAadhaarNumber('')
    setFile(null)
    onClose()
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'under_process':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'pending':
        return 'Document uploaded successfully! Verification is pending.'
      case 'under_process':
        return 'Your document is currently being processed.'
      case 'verified':
        return 'Your Aadhaar has been successfully verified!'
      default:
        return 'Upload your Aadhaar document for verification'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Aadhaar Verification
          </DialogTitle>
          <DialogDescription>
            {getStatusText()}
          </DialogDescription>
        </DialogHeader>

        {verificationStatus === 'none' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload Aadhaar card'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPG, PNG, PDF (max 5MB)
                  </p>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isVerifying || aadhaarNumber.length !== 12 || !file}
              >
                {isVerifying ? 'Uploading...' : 'Submit for Verification'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {verificationStatus !== 'none' && (
          <DialogFooter>
            <Button onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}