import React, { useEffect, useRef, useState } from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector = ({ image, setImage, handleDeleteImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected File:", file);
      setImage(file);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };
  const handleRemoveImage = () => {
    setImage(null);
    handleDeleteImage();
  };

  useEffect(() => {
    console.log("Image from DB:", image);

    if (!image) {
      setPreviewUrl(null);
      return;
    }

    if (typeof image === "string") {
      //change the serPreviewUrl(image);
      setPreviewUrl(image.startsWith("http") ? image : `https://travel-story-w1jg.onrender.com${image}`);
    } else if (image instanceof File || image instanceof Blob) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl); // Cleanup
      };
    }
  }, [image]);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      {!image ? (
        <button
          className="w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-200/50"
          onClick={() => onChooseFile()}
        >
          <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border-cyan-100">
            <FaRegFileImage className="text-xl text-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Browse image file to upload</p>
        </button>
      ) : (
        <div className="w-full relative">
          <img
            src={previewUrl}
            alt="Selected"
            className="w-full h-[300px] object-cover rounded-lg"
          />
          <button
            className="btn-small btn-delete absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <MdDeleteOutline className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
