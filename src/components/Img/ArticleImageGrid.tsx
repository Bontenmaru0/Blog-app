import React from 'react'

export type GridImage = {
  image_url: string
}

interface Props {
  images: GridImage[]
  onRemove?: (index: number) => void
}

const ArticleImageGrid: React.FC<Props> = ({ images, onRemove }) => {
  const maxShow = 5
  const displayImages = images.slice(0, maxShow)
  const extraCount = images.length - maxShow

  if (!images || images.length === 0) return null

  return (
    <div className="container bg-white p-2 mt-3 rounded-2">
      {/* Top row */}
      <div className="d-flex gap-2 mb-2">
        {displayImages.slice(0, 2).map((img, idx) => (
          <ImageBox
            key={idx}
            img={img.image_url}
            index={idx}
            extraCount={idx === 1 ? extraCount : 0} // +N only top-right
            onRemove={onRemove}
            aspect="4 / 3"
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="d-flex gap-2">
        {displayImages.slice(2, 5).map((img, idx) => (
          <ImageBox
            key={idx + 2}
            img={img.image_url}
            index={idx + 2}
            onRemove={onRemove}
            aspect="1 / 1"
          />
        ))}
      </div>
    </div>
  )
}

export default ArticleImageGrid

// ==============================
// Helper component
interface ImageBoxProps {
  img: string
  index: number
  aspect: string
  onRemove?: (index: number) => void
  extraCount?: number
}

const ImageBox: React.FC<ImageBoxProps> = ({
  img,
  index,
  aspect,
  onRemove,
  extraCount = 0
}) => {
  return (
    <div
      className="position-relative article-img cursor-pointer"
      style={{
        flex: 1,
        aspectRatio: aspect,
        overflow: 'hidden',
        borderRadius: 0,
      }}
    >
      {/* X remove button */}
      {onRemove && (
        <span
          onClick={() => onRemove(index)}
          className="position-absolute top-0 end-0 me-2"
          style={{
            cursor: 'pointer',
            color: '#6c757d', // gray default
            fontWeight: 'bold',
            fontSize: '1.1rem',
            zIndex: 5,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#000000#6c757d')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}
        >
          ✕
        </span>
      )}

      <img
        src={img}
        className="w-100 h-100"
        style={{ objectFit: 'cover' }}
        alt=""
      />

      {/* Extra count overlay on top-right image only */}
      {extraCount > 0 && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white fs-3 fw-bold">
          +{extraCount}
        </div>
      )}
    </div>
  )
}
