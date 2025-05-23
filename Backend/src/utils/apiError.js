class apiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.name = this.constructor.name;
        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors

        // to show other coders the structured errors

        if(stack)
        {
            this.stack = stack
        }else
        {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {apiError}