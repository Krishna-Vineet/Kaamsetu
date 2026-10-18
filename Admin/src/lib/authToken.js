// Central place for reading/writing the admin session token.
// sessionStorage is used intentionally: the session dies with the tab,
// which is the right default for an admin panel.
export const ADMIN_TOKEN_KEY = "kaamsetu_admin_token"

export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY)

export const setAdminToken = (token) => {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  }
}

export const clearAdminToken = () => sessionStorage.removeItem(ADMIN_TOKEN_KEY)
