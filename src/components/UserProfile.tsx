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
        <h5 className="offcanvas-title" id="profileOffcanvasLabel">
          Profile
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>

      <div className="offcanvas-body">
        {/* profile content */}
      </div>
    </div>
  )
})

export default ProfileOffcanvas
