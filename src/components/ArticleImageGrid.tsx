import React from 'react'

// Types
export type GridImage = {
  id: string
  image_url: string
  alt_text?: string | null
}

interface Props {
  images: GridImage[]
  onRemove?: (index: number) => void
  onImageClick?: (image: GridImage, index: number) => void
}

// Main Component
const ArticleImageGrid: React.FC<Props> = ({ images, onRemove, onImageClick }) => {
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
            key={img.id}               // ✅ STABLE KEY
            img={img}                // ✅ PASS OBJECT
            index={idx}
            extraCount={idx === 1 ? extraCount : 0}
            onRemove={onRemove}
            onImageClick={onImageClick}
            aspect="4 / 3"
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="d-flex gap-2">
        {displayImages.slice(2, 5).map((img, idx) => (
          <ImageBox
            key={img.id}               // ✅ STABLE KEY
            img={img}
            index={idx + 2}
            onRemove={onRemove}
            onImageClick={onImageClick}
            aspect="4 / 3"
          />
        ))}
      </div>
    </div>
  )
}


export default ArticleImageGrid

// helper
interface ImageBoxProps {
  img: GridImage
  index: number
  aspect: string
  onRemove?: (index: number) => void
  onImageClick?: (image: GridImage, index: number) => void
  extraCount?: number
}

const ImageBox: React.FC<ImageBoxProps> = ({
  img,
  index,
  aspect,
  onRemove,
  onImageClick,
  extraCount = 0,
}) => {
  return (
    <div
      className="position-relative article-img"
      style={{
        flex: 1,
        aspectRatio: aspect,
        overflow: 'hidden',
        borderRadius: 0,
        cursor: onImageClick ? 'pointer' : 'default',
      }}
      onClick={() => onImageClick?.(img, index)} // ✅ CORRECT
    >
      {/* Remove Button */}
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation() // prevent triggering onImageClick
            onRemove(index)
          }}
          className="position-absolute top-0 end-0 me-2"
          style={{
            cursor: 'pointer',
            color: '#6c757d', // gray default
            fontWeight: 'bold',
            fontSize: '1.1rem',
            zIndex: 5,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}
        >
          ✕
        </span>
      )}

      {/* Image */}
      <img
        src={img.image_url}
        className="w-100 h-100"
        style={{ objectFit: 'cover' }}
        alt=""
      />

      {/* Extra count overlay */}
      {extraCount > 0 && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white fs-3 fw-bold">
          +{extraCount}
        </div>
      )}
    </div>
  )
}
