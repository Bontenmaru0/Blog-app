import React from 'react'

interface ArticleImagesProps {
  images: string[]
}

const ArticleImages: React.FC<ArticleImagesProps> = ({ images }) => {
  const maxShow = 5
  const displayImages = images.slice(0, maxShow)
  const extraCount = images.length - maxShow

  if (!images || images.length === 0) return null

  return (
    <div className="container bg-white p-2 mt-3 rounded-2">
      {/* Top row: 2 images */}
      <div className="d-flex gap-2 mb-2">
        {displayImages.slice(0, 2).map((img, idx) => (
          <div
            key={idx}
            className="position-relative flex-fill article-img cursor-pointer" // <--- add class for hover effect
            style={{
              aspectRatio: '1/1',
              overflow: 'hidden',
              borderRadius: '0', // edgy: no round corners
              transition: 'transform 0.25s ease, filter 0.25s ease', // subtle hover
            }}
          >
            {/* Optional subtle overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }}
            />

            <img
              src={img}
              alt={`article-${idx}`}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />

            {idx === 1 && extraCount > 0 && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white fs-3 fw-bold">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom row: 3 images */}
      <div className="d-flex gap-2">
        {displayImages.slice(2, 5).map((img, idx) => (
          <div
            key={idx} 
            className="position-relative flex-fill article-img cursor-pointer" // hover effect
            style={{
              aspectRatio: '1/1',
              overflow: 'hidden',
              borderRadius: '0', //
              transition: 'transform 0.25s ease, filter 0.25s ease',
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }}
            />

            <img
              src={img}
              alt={`article-${idx + 2}`}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* CSS Hover effect */}
      <style>
        {`
          .article-img:hover img {
            transform: scale(1.03);
            filter: contrast(1.05) brightness(0.95);
            transition: transform 0.25s ease, filter 0.25s ease;
          }

          .article-img:hover::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(255,255,255,0.08); /* subtle highlight/overlay */
            pointer-events: none;
          }
        `}
      </style>
    </div>
  )
}

export default ArticleImages
