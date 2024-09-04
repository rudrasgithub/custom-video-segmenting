import { createSlice } from "@reduxjs/toolkit";

const videoSlice = createSlice({
    name: 'video',
    initialState: {
        url: '',
        isVideoPlaying: false,
        startTime: 0,
        endTime: 0,
        video: null,
        loading: false,
        error: null
    },
    reducers: {
        setUrl(state, action) {
            state.url = action.payload
        },
        setIsVideoPlaying(state, action) {
            state.isVideoPlaying = action.payload
        },
        setStartTime(state, action) {
            state.startTime = action.payload;
        },
        setEndTime(state, action) {
            state.endTime = action.payload;
        },
        setVideo(state, action) {
            state.video = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        resetVideoState(state) {
            state.isVideoPlaying = false;
            state.video = null;
            state.startTime = 0,
            state.endTime = 0,
            state.error = null;
            state.loading = false;
        },
    }
});

export const { 
    setUrl, 
    setIsVideoPlaying, 
    setStartTime, 
    setEndTime, 
    setVideo,
    setLoading, 
    setError,
    resetVideoState
} = videoSlice.actions;

export default videoSlice.reducer;