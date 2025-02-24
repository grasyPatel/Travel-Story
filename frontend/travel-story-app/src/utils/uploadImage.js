import axiosInstance from "./axiosinstance";

const uploadImage = async (imageFile) => {
    if (!imageFile || !(imageFile instanceof File)) {
        const imgUploadRes = await uploadImage(storyImg);
        imageUrl = imgUploadRes.imageUrl || "";
        console.error("Invalid image file:", imageFile);
        throw new Error("Invalid image file. Please upload a valid file.");
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const response = await axiosInstance.post("/image-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Image Upload Response:", response.data); // Debugging Log
        return response.data;
    } catch (error) {
        console.error("Error uploading the image:", error?.response?.data || error.message);
        throw error;
    }
};

export default uploadImage;
