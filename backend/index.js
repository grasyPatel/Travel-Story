require("dotenv").config();



const config=require("./config.json");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const express=require("express");
const cors=require("cors");
const {authenticateToken}=require('./utilities')


const jwt=require("jsonwebtoken");
const upload=require("./multer");
const fs=require("fs");
const path=require("path");
const User=require("./models/user.model");

const TravelStory=require("./models/travelStory.model");
const { error } = require("console");
const { json } = require("stream/consumers");


mongoose.connect(config.connectionString)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error("Connection error:", err));


const app=express();

app.use(express.json());

app.use(cors({origin:"*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));


app.get("/",(req,res)=>{
   res.send("hello")
})
//Create account
app.post("/create-account",async (req,res)=>{
    const {fullName,email,password}=req.body;
   ;
    console.log(fullName);
    if(!fullName|| !email|| !password){
        return res.status(400).json({error:true,message:"All fields are rerquired"});
        
    }

    const isUser=await User.findOne({email});
    if(isUser){
        return res.status(400).json({error:true, message:"User Already exits"});
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=new User({
        fullName,
        email,
        password:hashedPassword,
    })
    await user.save();

    const accessToken=jwt.sign(
        {userId:user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );

    return res.status(201).json({
        error:false,
        user:{fullName:user.fullName,email:user.email},
        accessToken,
        message:"Registration successfull",
    });

});

//Login
app.post("/login",async(req,res)=>{
    const {email, password}=req.body;
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required,"});
    }

    const user=await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"User not found"});

    }

    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({message:"Invaild Credentials"});
    }
    const accessToken=jwt.sign(
        {userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );
    return res.json({
        error: false,
        message: "Login Successul",
        user:{fullName:user.fullName, email:user.email},
        accessToken,
    });
});

//get User
app.get("/get-user",  authenticateToken, async(req,res)=>{
    const {userId}= req.user
    
    const isUser =await User.findOne({_id:userId});
    if(!isUser){
        return res.sendStatus(401);

    }
    return res.json({
        user: isUser,

        message:"",
    });

})

//Route to handle image upload
app.post("/image-upload", upload.single("image"), async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({error:true,message:"No image Uploaded."});
        }
        const imageUrl=`http://localhost:8000/uploads/${req.file.filename}`;
        res.status(201).json({imageUrl});

    }catch(error){
        res.status(500).json({error:true,message:error.message})
    }

})

//Delete an image from uploads folder
app.delete("/delete-image", async(req,res)=>{
    const {imageUrl}=req.body;
    if(!imageUrl){
        return res.status(400).json({error:true,message:"Image Url Parameter is required."})
    }
    try{
        const filename=path.basename(imageUrl);
        const filePath=path.join(__dirname,'uploads',filename);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            res.status(200).json({message:"Image deleted successfully."});

        }else{
            res.status(200).json({error:true,message:"Image not found."});
        }
    }catch(error){
        res.status(500).json({error:true,message:error.message});

    }

})


//Serve static files form the uploads  and assets directory
app.post("uploads", express.static(path.join(__dirname,"uploads")));
app.post("assets", express.static(path.join(__dirname,"assets")))

// Add  Travel Story
app.post("/add-travel-story", authenticateToken, async(req,res)=>{
    const {title,story,visitedLocation, imageUrl,visitedDate}=req.body;
    const {userId}=req.user;

    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate){
        return res.status(400).json({error:true,message:"All fields are required."})
    }
    const paresedVisitedDate=new Date(parseInt(visitedDate));
    try{
        const travelStory=new  TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: paresedVisitedDate,
        });
        await travelStory.save();
        res.status(201).json({story:travelStory,message:'Added Successfully.'})
        
    }catch (error){
        res.status(400).json({error:true, message:error.message})

    }


});

// Get all travel Story
app.get("/get-all-stories", authenticateToken, async(req,res)=>{
    const {userId}=req.user;
    try{
        const travelStories=await TravelStory.find({userId:userId}).sort({isFavourite:-1})
        res.status(200).json({stories:travelStories})

    }catch(error){
        res.status(500).json({error:true,message:error.message});
    }
})

//Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async(req,res)=>{
    const {id}=req.params;
    const {title, story, visitedLocation,imageUrl,visitedDate}=req.body;
    const {userId}=req.user;

    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate){
        return res.status(404).json({error:true,message:"All fields are required."})
    }
    const paresedVisitedDate=new Date(parseInt(visitedDate));


    try{
        const travelStory=await TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({error:true, message:"Travel Story not found"});
        }

        const placeholderImgUrl=`http://localhost:8000/assets/placeholder.png`;

        travelStory.title=title;
        travelStory.story=story;
        travelStory.visitedLocation=visitedLocation;
        travelStory.imageUrl=imageUrl || placeholderImgUrl;
        travelStory.visitedDate=paresedVisitedDate;

        await travelStory.save();
        res.status(200).json({story:travelStory,message:"Updated sucessfully"})

    }catch (error){
        res.status(500).json({error:true,message:error.message});

    }


});

//Delete Travel Story
app.put("/delete-story/:id", authenticateToken, async(req,res)=>{
    const {id}=req.params;
    const  {userId}=req.user;
   try{
        const travelStory=await TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({error:true, message:"Travel Story not found"});
        }

        await travelStory.deleteOne({_id:id, userId:userId});

        const imageUrl=travelStory.imageUrl;

        const filename=path.basename(imageUrl);
        const filePath=path.join(__dirname,'uploads',filename);

        fs.unlink(filePath,(err)=>{
            if(err){
                console.log("Failed to Delete image url",err);
            }
        });
        res.status(200).json({message:"Travel Story Deleted."})
   }catch(error){
    res.status(500).json({error:true,message:error.message});

   }



});

//Update Favourite
app.put("/update-is-favourite/:id", authenticateToken, async(req,res)=>{
    const {id}=req.params;
    const {isFavourite}=req.body;
    const {userId}=req.user;

    try{
        const travelStory=await  TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({error:true,message:"travel story not found."});
        }

        travelStory.isFavourite =isFavourite;
        await travelStory.save();
        res.status(200).json({story:travelStory,message:"Update Succesfully"})
    }catch(error){
        res.status(500).json({error:true,message:error.message});

    }



});


//Search Travel Story
app.get("/search", authenticateToken, async(req,res)=>{
    const {query}=req.query;
    const {userId}=req.user;

    if(!query){
        return res.status(404).json({error:true,message:"Query is required"});
    }

    try{
        const searchResults=await  TravelStory.find({
            userId:userId,
            $or:[
                {title:{$regex:query, $options:"i"}},
                {story:{$regex:query, $options:"i"}},
                {visitedLocation:{$regex:query, $options:"i"}},
 
            ],
        }).sort({isFavourite:-1});

        res.status(200).json({story:searchResults});
    }catch(error){
        res.status(500).json({error:true,message:error.message});
    }

});

//filter travel story
app.get("/travel-stories/filter", authenticateToken, async(req,res)=>{
    const {startDate, endDate}=req.query;
    const {userId}=req.user;
     

    try{
        const start= new Date(parseInt(startDate));
        const end =new Date(parseInt(endDate));
        const filterStories =await TravelStory.find({
            userId:userId,
            visitedDate:{$gte:start,$lte:end},

        }).sort({isFavourite:-1});
        res.status(200),json({stories:filterStories});
    }catch(error){
        res.status(500).json({error:true,message:error.message});
    }

});








app.listen(8000);
// http://localhost:8000/ 
module.exports=app;