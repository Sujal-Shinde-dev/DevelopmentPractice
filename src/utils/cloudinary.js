import  {vs as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({ 
    cloud_name:  CLOUD_NAME,
    api_key:  API_KEY,
    api_secret: API_SECRET // Click 'View API Keys' above to copy your API secret
});
const fileUpload=async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response=await cloudinary.upload.uploader(localfilepath,{
            resource_type:'auto'
        })
        console.log("File upload on cloudinary url",response.url)

        return response
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null
    }
}
export {fileUpload}