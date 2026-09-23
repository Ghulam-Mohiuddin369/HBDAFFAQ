import { useEffect, useRef, useState } from 'react';
import { api, isCancelled, uploadMedia } from '../api';
import { toast } from '../ui';
import { rememberedName, rememberName } from './WishForm';
import Icon from './Icon';

const MAX_IMAGE_MB = 15;
const MAX_VIDEO_MB = 100;

export default function UploadForm({ onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [name, setName] = useState(rememberedName);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const isVideo = file?.type.startsWith('video/');

  function pick(f) {
    if (!f) return;
    const video = f.type.startsWith('video/');
    if (!video && !f.type.startsWith('image/')) {
      setError('Please choose a photo or a video.');
      return;
    }
    const limit = video ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (f.size > limit * 1024 * 1024) {
      setError(`That file is too big. ${video ? 'Videos' : 'Photos'} can be up to ${limit} MB.`);
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) {
      setError('Choose a photo or video first.');
      return;
    }
    if (!name.trim()) {
      setError('Add your name so Affaq knows who shared it.');
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setError('');
    try {
      const up = await uploadMedia(file, setProgress, controller.signal);
      if (controller.signal.aborted) return;
      const memory = await api.addMemory({
        name,
        caption,
        type: up.resource_type === 'video' ? 'video' : 'image',
        url: up.secure_url,
        publicId: up.public_id,
        width: up.width,
        height: up.height,
        duration: up.duration,
      });
      rememberName(name);
      // clear the form so the next memory can be shared right away
      setFile(null);
      setPreview('');
      setCaption('');
      if (inputRef.current) inputRef.current.value = '';
      onDone(memory);
    } catch (err) {
      if (isCancelled(err)) toast('Upload cancelled.', 'info');
      else setError(err.message);
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setBusy(false);
        setProgress(0);
      }
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  // stop an in-flight upload if the visitor leaves the page
  useEffect(() => () => controllerRef.current?.abort(), []);

  return (
    <form className="upload-form" onSubmit={submit}>
      <label
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => pick(e.target.files[0])}
          disabled={busy}
        />
        {preview ? (
          isVideo ? (
            <video src={preview} className="dropzone-preview" muted autoPlay loop playsInline />
          ) : (
            <img src={preview} className="dropzone-preview" alt="Preview" />
          )
        ) : (
          <span className="dropzone-empty">
            <span className="dropzone-icon"><Icon name="camera" size={30} strokeWidth={1.6} /></span>
            <strong>Tap to choose a photo or video</strong>
            <small>or drag it here · photos up to {MAX_IMAGE_MB} MB, videos up to {MAX_VIDEO_MB} MB</small>
          </span>
        )}
        {file && !busy && <span className="dropzone-change">Change</span>}
      </label>

      <label className="field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Ali" />
      </label>
      <label className="field">
        <span>Caption</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="What's the story behind this one?"
        />
      </label>

      {/* the button itself fills up as the upload progresses */}
      <div className="upload-actions">
        <button
          className={`btn btn-primary btn-block btn-progress ${busy ? 'is-busy' : ''}`}
          disabled={busy}
          style={{ '--p': `${Math.round(progress * 100)}%` }}
          aria-live="polite"
        >
          <span className="btn-progress-fill" aria-hidden="true" />
          <span className="btn-progress-label">
            {!busy && <><Icon name="upload" /> Share this memory</>}
            {busy && progress < 1 && `Uploading ${Math.round(progress * 100)}%`}
            {busy && progress >= 1 && 'Almost done…'}
          </span>
        </button>
        {busy && (
          <button type="button" className="btn btn-cancel" onClick={cancel}>
            <Icon name="x" size={16} /> Cancel
          </button>
        )}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
