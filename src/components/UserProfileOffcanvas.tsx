import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logoutThunk } from '../features/auth/authSlice'
import { changePasswordThunk } from '../features/auth/authSlice'

export type ProfileOffcanvasHandle = {
  open: () => void
  close: () => void
}

const ProfileOffcanvas = forwardRef<ProfileOffcanvasHandle>((_, ref) => {
  const offcanvasRef = useRef<HTMLDivElement | null>(null)
  const bsOffcanvasRef = useRef<any>(null)

  const { profile, fetchProfileLoading } = useAppSelector((state) => state.profiles)
  const fullName = profile?.full_name ?? ''
  const bio = profile?.bio ?? ''

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

  const { logoutLoading, logoutError, changePasswordLoading, changePasswordError } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const selfRef = ref as React.RefObject<ProfileOffcanvasHandle>
  const handleLogout = async () => {
    try {
      if (!passwordsMatch) return
      await dispatch(logoutThunk()).unwrap()
      window.showToast('See you next time 👋', 'Logged out successfully.', 'success')
      selfRef?.current?.close()
    } catch (err) {
      window.showToast('Error', logoutError || 'Log out failed. Something went wrong', 'error')
    }
  }

  const [ newPassword, setNewPassword ] = useState('')
  const [ verifyPassword, setVerifyPassword] = useState('')
  
  const passwordsMatch =
        newPassword.length > 0 &&
        verifyPassword.length > 0 &&
        newPassword === verifyPassword

  const showPasswordError =
        newPassword.length > 0 &&
        verifyPassword.length > 0 &&
        newPassword !== verifyPassword
        const handleChangePassword = async () => {
    try {
      await dispatch(changePasswordThunk({newPassword})).unwrap()
      window.showToast('Password changed.', 'Password changed succesfully.', 'success')
    } catch (err) {
      window.showToast('Error', changePasswordError || 'Changing password failed. Something went wrong.', 'error')
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
          {fetchProfileLoading? 'Name Loading...' : fullName}'s Profile
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
        <form className="mt-2">
          <input type="text" className="form-control rounded-0" placeholder="Profile Name"  defaultValue={fullName}/>
          <textarea className="form-control mt-2 rounded-0 bio-textarea" placeholder="Your bio, your rules..." rows={3} defaultValue={bio}></textarea>
          <button type="submit" className="btn btn-dark w-100 rounded-0 mt-3">
            Save Changes
          </button>
        </form>
        <hr />
        <h5 className="no-select">Password Settings</h5>
        <form>
          {showPasswordError && ( <div className="text-center text-danger mb-3" style={{ fontSize: '0.85rem' }}> Passwords do not match </div> )}
          <input type="password" className="form-control mt-2 rounded-0" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input type="password" className="form-control mt-2 rounded-0" placeholder="Confirm New Password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)}/>
          <button type="submit" className="btn btn-dark w-100 rounded-0 mt-3" disabled={changePasswordLoading || !passwordsMatch} onClick={handleChangePassword}>
            {changePasswordLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
        <div className="mt-auto">
          <hr />
          {logoutLoading ? (
            <button className="btn btn-outline-dark w-100 rounded-0">
              Logging out...
            </button>
          ) : (
            <button className="btn btn-outline-dark w-100 rounded-0"
                    onClick={(e) => {
                      e.preventDefault()
                    handleLogout()
              }}
            >
              {logoutLoading? 'LOGGING OUT...': 'LOG OUT'}
            </button>
          )}
          
        </div>
      </div>
      
    </div>
  )
})

export default ProfileOffcanvas
