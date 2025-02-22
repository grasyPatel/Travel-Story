import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosinstance';
import {MdAdd} from 'react-icons/md';
import Modal from 'react-modal';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import AddEditTravelStory from '../Home/AddEditTravelStory';
import { ToastContainer , toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories]=useState([]);

  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: "add",
    data:null,
  });


 

// Fetch User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      console.log(response.data)
      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching user info:", error);
      }
    }
  };

//get all Stories
   const getAllTravelStories=async ()=> {
    try{
      const response =await axiosInstance.get("/get-all-stories"); 
      if(response.data && response.data.stories){
        setAllStories(response.data.stories);
      }

    }catch(error){
      console.log("An unexpected error occurred. Please try Again.")

    }
    
   }
//handle edit stroy click

   const handleEdit=(data)=>{

   } 

//handle travel Stroy Click 
   const handleViewStory=(data)=>{

   }

//handle update favourite
   const updateIsFavourite=async(storyData)=>{
    const storyId=storyData._id;
    try{
      const response = await axiosInstance.put(
      "/update-is-favourite/"+storyId,{
        isFavourite:!storyData.isFavourite,
      });
      if(response.data && response.data.story){
        toast.success("Story Updated Successfully.")
        getAllTravelStories();
      }
    }catch(error){
      console.log("An unexpected error occurred. Please try again.")

    }

   }

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} />
      <div className="container mx-auto py-10">
        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length>0?(
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item)=>{
                  return (
                    <TravelStoryCard key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onEdit={()=>handleEdit(item)}
                    onClick={()=>handleViewStory(item)}
                    onfavouriteClick={()=>updateIsFavourite(item)}
                     />
                  );
                })}
              </div>  
            ):(
              <>Empty Card Here</>
            )}
          </div>
          <div className="w-[320px]"></div>
        </div>
      </div>
      {/* Add & edit Travel Story */}
      <Modal isOpen={openAddEditModel.isShown}
        onRequestClose={()=>{}}
        style={{
          overlay:{
            backgroundColor:"rgba(0,0,0,0.2)",
            zIndex:999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"

      >
        <AddEditTravelStory
        type={openAddEditModel.type}
        storyInfo={openAddEditModel.data}
        onClose={()=>{
          setOpenAddEditModel({isShown:false,type:"add",data:null})
        }}
        getAllTravelStories={getAllTravelStories}
        />

      </Modal>

      <button className='w-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10' onClick={()=>{
        setOpenAddEditModel({isShown:true, type:"add", data: null});
      }}><MdAdd className=" text-[32px] text-white" /></button>
      < ToastContainer />
    </>
  );
};

export default Home