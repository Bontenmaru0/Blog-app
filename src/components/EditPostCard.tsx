import { useState, useEffect } from 'react'
import ArticleImageGrid from './ArticleImageGrid'

/* ================= TYPES ================= */

interface GridImage {
  image_url: string
  type?: 'existing' | 'new'
}

interface ArticleImage {
  image_url: string
}

interface Article {
  id: string
  title: string
  content: string
  images: ArticleImage[]
  author: string
  created_at: string
  updated_at?: string
  updated_by?: string
}

interface Props {
  article: Article
  onCancel: () => void
  onConfirmSave: (data: {
    title: string
    content: string
    files: File[]
    removedImages: string[]
  }) => void
}

/* ================= COMPONENT ================= */

export default function EditPostCard({
  article,
  onCancel,
  onConfirmSave,
}: Props) {
  const [title, setTitle] = useState(article.title ?? '')
  const [content, setContent] = useState(article.content ?? '')
  const [confirmSave, setConfirmSave] = useState(false)

  /* ---------- Existing images ---------- */
  const [existingImages, setExistingImages] = useState<string[]>(
    article.images?.map(img => img.image_url) ?? []
  )
  const [removedImages, setRemovedImages] = useState<string[]>([])

  /* ---------- New images ---------- */
  type NewImage = { file: File; preview: string }
  const [newImages, setNewImages] = useState<NewImage[]>([])

  /* ---------- Reset on article change ---------- */
  useEffect(() => {
    setTitle(article.title ?? '')
    setContent(article.content ?? '')
    setConfirmSave(false)
    setExistingImages(article.images?.map(img => img.image_url) ?? [])
    setRemovedImages([])
    setNewImages([])
  }, [article])

  /* ---------- Cleanup object URLs ---------- */
  useEffect(() => {
    return () => {
      newImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [newImages])

  /* ---------- Add images ---------- */
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const added = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setNewImages(prev => [...prev, ...added])
  }

  /* ---------- Combine images for grid ---------- */
  const imagesToShow: GridImage[] = [
    ...existingImages.map(url => ({
      image_url: url,
      type: 'existing' as const,
    })),
    ...newImages.map(img => ({
      image_url: img.preview,
      type: 'new' as const,
    })),
  ]

  /* ---------- Remove image ---------- */
  const handleRemove = (index: number) => {
    const image = imagesToShow[index]
    if (!image) return

    if (image.type === 'existing') {
      setExistingImages(prev =>
        prev.filter(url => url !== image.image_url)
      )
      setRemovedImages(prev => [...prev, image.image_url])
    } else {
      setNewImages(prev =>
        prev.filter(img => img.preview !== image.image_url)
      )
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="card mb-3 rounded-0">
      <div className="card-body d-flex flex-column">
        {/* Title input */}
        <input
          type="text"
          className="form-control rounded-0 mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        {/* Content textarea */}
        <textarea
          className="form-control rounded-0 mb-2"
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />

        {/* File input */}
        <input
          type="file"
          multiple
          accept="image/*"
          className="form-control rounded-0 mb-2"
          onChange={handleAddImages}
        />

        {/* Image Grid */}
        <ArticleImageGrid images={imagesToShow} onRemove={handleRemove} />

        {/* Metadata */}
        <small className="text-muted d-block mt-2 mb-2">
          Published by {article.author} •{' '}
          {new Date(article.created_at).toLocaleDateString()}
          {article.updated_at && article.updated_by && (
            <> | Updated by {article.updated_by} • {new Date(article.updated_at).toLocaleDateString()}</>
          )}
        </small>

        {/* Buttons */}
        <div className="d-flex gap-2 mt-2 justify-content-end flex-wrap flex-sm-nowrap">
          {!confirmSave ? (
            <>
              <button
                type="button"
                className="btn btn-link p-0 text-success text-decoration-none"
                onClick={() => setConfirmSave(true)}
              >
                SAVE
              </button>
              <span className="mx-1">|</span>
              <button
                type="button"
                className="btn btn-link p-0 text-secondary text-decoration-none"
                onClick={onCancel}
              >
                CANCEL
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-link p-0 text-success text-decoration-none"
                onClick={() =>
                  onConfirmSave({
                    title,
                    content,
                    files: newImages.map(img => img.file),
                    removedImages,
                  })
                }
              >
                YES
              </button>
              <span className="mx-1">-</span>
              <button
                type="button"
                className="btn btn-link p-0 text-secondary text-decoration-none"
                onClick={() => setConfirmSave(false)}
              >
                NO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
