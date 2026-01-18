import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchProfile, createProfile, updateProfile } from './profilesService'

interface ProfilesState{
    profile: any | null

    fetchProfileLoading: boolean
    fetchProfileError: string | null

    createProfileLoading: boolean
    createProfileError: string | null

    updateProfileLoading: boolean
    updateProfileError: string | null
}

const initialState: ProfilesState = {
    profile: null,

    fetchProfileLoading: false,
    fetchProfileError: null,

    createProfileLoading: false,
    createProfileError: null,

    updateProfileLoading: false,
    updateProfileError: null
}

 export const fetchProfileThunk = createAsyncThunk(
  'profile/fetchUser',
  async() => {
    const data = await fetchProfile();
    return data?.[0] ?? null; // return single object or null
  }
)

export const createProfileThunk = createAsyncThunk(
    'profiles/createUser',
    async({id, full_name, bio}:{id: string, full_name: string, bio: string}) => {
        return createProfile(id, full_name, bio)
    }
)

export const updateProfileThunk = createAsyncThunk(
    'profiles/updateUser',
    async({id, full_name, bio}:{id: string, full_name: string, bio: string}) => {
        return updateProfile(id, full_name, bio)
    }
)

const profilesSlice = createSlice({
    name: 'profiles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetch/get
            .addCase(fetchProfileThunk.pending, (state) => {
                state.fetchProfileLoading = true;
            })
            .addCase(fetchProfileThunk.fulfilled, (state, action) => {
                state.fetchProfileLoading= false;
                state.profile = action.payload;
            })
            .addCase(fetchProfileThunk.rejected, (state, action) => {
                state.fetchProfileLoading = false;
                state.fetchProfileError = action.error.message || 'Something went wrong.'
            })
            // create profile
            .addCase(createProfileThunk.pending, (state) => {
                state.createProfileLoading = true;
                state.createProfileError = null;
            })
            .addCase(createProfileThunk.fulfilled, (state, action) => {
                state.createProfileLoading = false;
                state.profile = action.payload;
            })
            .addCase(createProfileThunk.rejected, (state, action) => {
                state.createProfileLoading = false;
                state.createProfileError = action.error.message || 'Failed to create profile';
            });
    },
});

export default profilesSlice.reducer