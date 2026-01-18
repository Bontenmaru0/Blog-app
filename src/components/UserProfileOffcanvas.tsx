import { forwardRef, useImperativeHandle, useRef, useState, useEffect, } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logoutThunk, changePasswordThunk } from '../features/auth/authSlice'
import { updateProfileThunk } from '../features/profiles/profilesSlice'

export type ProfileOffcanvasHandle = {
  open: () => void
  close: () => void
}

const ProfileOffcanvas = forwardRef<ProfileOffcanvasHandle>((_, ref) => {
  const offcanvasRef = useRef<HTMLDivElement | null>(null)
  const bsOffcanvasRef = useRef<any>(null)

  const dispatch = useAppDispatch()

  const {
    profile,
    fetchProfileLoading,
    updateProfileLoading,
    updateProfileError,
  } = useAppSelector((state) => state.profiles)

  const {
    logoutLoading,
    logoutError,
    changePasswordLoading,
    changePasswordError,
    user,
  } = useAppSelector((state) => state.auth)

  const userId = user?.id ?? ''

  useImperativeHandle(ref, () => ({
    open() {
      if (!offcanvasRef.current) return

      if (!bsOffcanvasRef.current) {
        // @ts-ignore
        bsOffcanvasRef.current = new window.bootstrap.Offcanvas(
          offcanvasRef.current
        )
      }

      bsOffcanvasRef.current.show()
    },
    close() {
      bsOffcanvasRef.current?.hide()
    },
  }))

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: '',
  })


  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name,
        bio: profile.bio,
      })
    }
  }, [profile])

  const submitUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileForm.fullName.trim() || !profileForm.bio.trim()) {
      window.showToast('Error', 'Profile fields cannot be empty', 'error')
      return
    }

    try {
      await dispatch(
        updateProfileThunk({
          id: userId,
          full_name: profileForm.fullName,
          bio: profileForm.bio,
        })
      ).unwrap()

      window.showToast(
        'Profile updated',
        'Profile updated successfully',
        'success'
      )
    } catch (err) {
      window.showToast(
        'Error',
        updateProfileError || 'Profile update failed',
        'error'
      )
    }
  }

  const [newPassword, setNewPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')

  const passwordsMatch =
    newPassword.length > 0 &&
    verifyPassword.length > 0 &&
    newPassword === verifyPassword

  const showPasswordError =
    newPassword.length > 0 &&
    verifyPassword.length > 0 &&
    newPassword !== verifyPassword

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return

    try {
      await dispatch(changePasswordThunk({ newPassword })).unwrap()
      window.showToast(
        'Password changed',
        'Password changed successfully',
        'success'
      )
      setNewPassword('')
      setVerifyPassword('')
    } catch (err) {
      window.showToast(
        'Error',
        changePasswordError || 'Changing password failed',
        'error'
      )
    }
  }

  const selfRef = ref as React.RefObject<ProfileOffcanvasHandle>

  const submitLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap()
      window.showToast(
        'See you next time 👋',
        'Logged out successfully',
        'success'
      )
      selfRef?.current?.close()
    } catch (err) {
      window.showToast(
        'Error',
        logoutError || 'Logout failed',
        'error'
      )
    }
  }

  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-end"
      tabIndex={-1}
      id="profileOffcanvas"
      aria-labelledby="profileOffcanvasLabel"
    >
      <div className="offcanvas-header">
        <h2 className="offcanvas-title" id="profileOffcanvasLabel">
          {fetchProfileLoading
            ? 'Loading...'
            : `${profileForm.fullName}'s Profile`}
        </h2>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>

      <div className="offcanvas-body d-flex flex-column">
        <h5 className="no-select">User Information Settings</h5>
        <form className="mt-2" onSubmit={submitUpdateProfile}>
          <input
            type="text"
            className="form-control rounded-0"
            value={profileForm.fullName}
            onChange={(e) =>
              setProfileForm((prev) => ({
                ...prev,
                fullName: e.target.value,
              }))
            }
            required
          />

          <textarea
            className="form-control mt-2 rounded-0 bio-textarea"
            rows={3}
            value={profileForm.bio}
            onChange={(e) =>
              setProfileForm((prev) => ({
                ...prev,
                bio: e.target.value,
              }))
            }
          />

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-0 mt-3"
            disabled={updateProfileLoading}
          >
            {updateProfileLoading ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>

        <hr />

        <h5 className="no-select">Password Settings</h5>
        <form onSubmit={submitChangePassword}>
          {showPasswordError && (
            <div
              className="text-center text-danger mb-3"
              style={{ fontSize: '0.85rem' }}
            >
              Passwords do not match
            </div>
          )}

          <input
            type="password"
            className="form-control mt-2 rounded-0"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            className="form-control mt-2 rounded-0"
            placeholder="Confirm New Password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-0 mt-3"
            disabled={changePasswordLoading || !passwordsMatch}
          >
            {changePasswordLoading
              ? 'Changing Password...'
              : 'Change Password'}
          </button>
        </form>

        <div className="mt-auto">
          <hr />
          <button
            className="btn btn-outline-dark w-100 rounded-0"
            onClick={(e) => {
              e.preventDefault()
              submitLogout()
            }}
            disabled={logoutLoading}
          >
            {logoutLoading ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default ProfileOffcanvas
