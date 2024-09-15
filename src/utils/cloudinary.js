import  {v2 as cloudinary} from "cloudinary"//change vs
import fs from "fs"
cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});


const fileUpload=async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:'auto'
        });
        console.log("File upload on cloudinary url",response.url)
        fs.unlinkSync(localfilepath)
        return response
    } catch (error) {
        console.log("File upload error",error);//Added
        return null
    }
}
export {fileUpload}