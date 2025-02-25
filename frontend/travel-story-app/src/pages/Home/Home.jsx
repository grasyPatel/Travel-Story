import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { DayPicker } from "react-day-picker";
import EmptyCard from "../../components/Cards/EmptyCard";
import TravelStoryCard from "../../components/Cards/TravelStoryCard";
import AddEditTravelStory from "../Home/AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EmptyImg from "../../assets/images/logo.png";
import moment from "moment";
import { getEmptyCardImage, getEmptyCardMessage } from "../../utils/helper";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  // Fetch User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      console.log(response.data);
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
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try Again.");
    }
  };
  //handle edit stroy click

  const handleEdit = (data) => {
    setOpenAddEditModel({ isShown: true, type: "edit", data: data });
  };

  //handle travel Stroy Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  //handle update favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
    try {
      const response = await axiosInstance.put(
        "/update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );
      if (response.data && response.data.story) {
        toast.success("Favourite's Updated Successfully.");
        if (filterType === "search" && searchQuery) {
          onSearhStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };
  //Delete Story Handle
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete(`/delete-story/${storyId}`);
      if (response.data && !response.data.error) {
        toast.error("Story Deleted Successfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  //Search Handle
  const onSearhStory = async (query) => {
    try {
      const response = await axiosInstance.get(`/search`, {
        params: { query },
      });
      console.log("Search API Response:", response.data); // Debugging line
      if (response.data && response.data.story) {
        setFilterType("search");
        setAllStories(response.data.story);
      }
      if (response.data && response.data.story) {
        setFilterType("search");
        setAllStories(response.data.story);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setFilterType("");

    getAllTravelStories();
  };

  //Handle Date Filter Travel Story
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;

      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: {
            startDate,
            endDate,
          },
        });
        if (response.data && response.data.stories) {
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch (error) {
      console.log("An unexpected error occurred, Please try again!");
    }
  };

  //handle Date Range Search
  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };

  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  };

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearhStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
        />
        <div className="flex gap-7">
          <div className="flex-1  justify-center">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onEdit={() => handleEdit(item)}
                      onClick={() => handleViewStory(item)}
                      onfavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard
                imgSrc={getEmptyCardImage(filterType)}
                message={getEmptyCardMessage(filterType)}
              />
            )}
          </div>
          <div className="w-[340px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pageNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add & edit Travel Story */}
      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() => {
          setOpenAddEditModel({ isShown: false, type: "add", data: null });
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModel.type}
          storyInfo={openAddEditModel.data}
          onClose={() => {
            setOpenAddEditModel({ isShown: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/*Open View Travel Story */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {
          setOpenViewModal({ isShown: false, type: "add", data: null });
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((preState) => ({ ...preState, isShown: false }));
          }}
          onEditClick={() => {
            setOpenViewModal((preState) => ({ ...preState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null);
          }}
        />
      </Modal>

      <button
        className="w-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModel({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className=" text-[32px] text-white" />
      </button>
      <ToastContainer />
    </>
  );
};

export default Home;
