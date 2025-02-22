import React, { useState } from 'react'
import axiosInstance from '../../utils/axiosinstance';
import DateSelector from "../../components/Input/DateSelector";
import ImageSelector from '../../components/Input/imageSelector';
import uploadImage from '../../utils/uploadImage';
import TagInput from '../../components/Input/TagInput';
import {MdAdd , MdDeleteOutline, MdUpdate, MdClose} from "react-icons/md";
import { toast } from 'react-toastify';
import moment from 'moment';

const AddEditTravelStory = ({
    storyInfo, 
    type,
    onClose,
    getAllTravelStories,
}) => {
    const [title, setTitle]=useState("");
    const [storyImg, setStoryImg]=useState(null);
    const [story, setStory]= useState("");
    const [visitedLocation, setVisitedLocation]=useState([]);

    const [visitedDate, setVisitedDate]=useState(null);
    const [error, setError]=useState("");

//add new Stroy
    const addNewTravelStory=async()=>{
        try{
            let imageUrl="";
            if(storyImg){
                const imgUploadRes=await uploadImage(storyImg)
                imageUrl=imgUploadRes.imageUrl || "";
            }
            const response=await axiosInstance.post("/add-travel-story",{
                title,
                story,
                imageUrl: imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate? moment(visitedDate).valueOf():moment().valueOf(),


            });

            if(response.data && response.data.story){
                toast.success("Story Added Successfully.")
                getAllTravelStories();
                onClose();
            }
        }catch(error){

        }

    };

//update Story
    const updateTravelStory= async()=>{};

//Handle Click for add and update
    const HandleAddOrUpdateClick=()=>{
      

        console.log("input data:",{title,storyImg,story,visitedLocation,visitedDate});
        if(!title){
            setError("Please enter the title.");
            return;
        }

        if(!story){
            setError("Please Enter the Story");
            return;

        }

        setError("");

        if(type==="edit"){
            updateTravelStory();
        }else{
            addNewTravelStory();
        }
    };

    const handleDeleteStoryImg=async()=>{};




  return (
    <div>
        <div className='flex items-center justify-between'>
            <h5 className='text-xl font-medium text-slate-700'>{type==="add"? "Add Story":"Update Story"}</h5>
           <div>
            <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
               {type==="add"? <button className='btn-small' onClick={HandleAddOrUpdateClick}>
                    <MdAdd className="text-lg" /> ADD STORY 
                </button> :<>
                <button className='btn-small' onClick={HandleAddOrUpdateClick}>
                <MdUpdate className="text-lg" /> UPDATE STORY </button>

              
                </>
                }

                <button className='btn-small btn-delete' onClick={onClose}>
                    <MdClose className="text-lg" />
                </button>
            </div>

            {error && (
                <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
            )}
        </div>
        </div>

        <div>
            <div className='flex-1 flex flex-col gap-2 pt-4'>
                <label className='input-label'>TITLE</label>
                <input type='text' className='text-2xl text-slate-950 outline-none' placeholder='A Day at the great Wall' value={title} onChange={({target})=>setTitle(target.value)}/>

                <div className='my-3'>
                    <DateSelector date={visitedDate} setDate={setVisitedDate} />
                </div>

                <ImageSelector image={storyImg} setImage={setStoryImg} handleDeleteImage={handleDeleteStoryImg} />

                <div className='flex flex-col gap-2 mt-4'>
                    <label className='input-label'>STORY</label>
                    <textarea type="text" className='text-sm text-slate-950 outline-none bg-slate-100 p-2 rounded'
                          placeholder='Your Story'
                          rows={10}
                          value={story}
                          onChange={({target})=>setStory(target.value)}
                    ></textarea>
                </div>

                <div className='pt-3'>
                    <label className='input-label'>VISITED LOCATIONS</label>
                    <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default AddEditTravelStory