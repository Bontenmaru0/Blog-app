import { forwardRef, useImperativeHandle, useRef } from 'react'

export type ProfileOffcanvasHandle = {
  open: () => void
  close: () => void
}

const ProfileOffcanvas = forwardRef<ProfileOffcanvasHandle>((_, ref) => {
  const offcanvasRef = useRef<HTMLDivElement | null>(null)
  const bsOffcanvasRef = useRef<any>(null)

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
          Profile
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
          <input type="text" className="form-control rounded-0" placeholder="Profile Name"/>
          <textarea className="form-control mt-2 rounded-0 bio-textarea" placeholder="Your bio, your rules..." rows={3}></textarea>
          <button type="submit" className="btn btn-dark w-100 rounded-0 mt-3">
            Save Changes
          </button>
        </form>
        <hr />
        <h5 className="no-select">Password Settings</h5>
        <form>
          <input type="password" className="form-control rounded-0" placeholder="Old Password"/>
          <input type="password" className="form-control mt-2 rounded-0" placeholder="New Password"/>
          <input type="password" className="form-control mt-2 rounded-0" placeholder="Confirm New Password"/>
          <button type="submit" className="btn btn-dark w-100 rounded-0 mt-3">
            Change Password
          </button>
        </form>
        <hr />
        <div className="mt-auto">
          <hr />
          <button className="btn btn-outline-dark w-100 rounded-0">
            LOGOUT
          </button>
        </div>
      </div>
      
    </div>
  )
})

export default ProfileOffcanvas
