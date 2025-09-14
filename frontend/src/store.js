import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./features/video/videoSlice"

const store = configureStore({
    reducer: {
        video: videoReducer
    }
})
export default store;