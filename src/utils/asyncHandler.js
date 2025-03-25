// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).
//         catch((err) => next(err))
//     }
// }


// export default asyncHandler

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;


// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}  = ===== = const asyncHandler = (func) => async () => {}


    //using try catch statement

    // const asyncHandler = (fn) => async (req, res, next) => {
    //     try {
    //         await fn(req, res, next)
    //     } catch (error) {
    //         res.status(error.code || 500).json({
    //             success: false,
    //             message: error.message
    //         })
    //     }
    // }
