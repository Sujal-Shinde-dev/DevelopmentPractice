class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        stack="",
        errors=[]
    ){
        super(message)
        this.data=null
        this.success=false
        this.statuscode=statuscode
        this.errors=errors
        this.message=message
    }
}
export {ApiError}