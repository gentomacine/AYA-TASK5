

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: [true, "Firstname is needed"]
        },
        lastname: {
            type: String,
            required: [true, "Lastname is needed"]
        },
        username: {
            type: String,
        },
        location: {
            type: String,
        },

        email: {
            type: String,
            required: [true, "Firstname is needed"]
        },
        password: {
            type: String,
            required: [true, "password is needed"]
        },
        age: {
            type: Number,

        },
        created_at: {
            type: Date,

        },
        updated_at: {
            type: Date,

        },
        isActive: {
            type: Boolean,
            default: false
        },
        last_login: {
            type: Date,
            default: Date.now
        },
        login_count: {
            type: Number,
            default: 0
        },
        total_time_on_platform: {
            type: Number,
            default: 0
        },

        subscription_plan:
        {
            type: String,
            ref: "User"
        },
        subscription_start_date: {
            type: Date,
            ref: "User"
        },

        subscription_end_date: {
            type: Date,
            ref: "User"
        },

        status: {
            type: String,
            enum: ["active", "cancelled", "lapsed"]
        },
        response_time: {
            type: Date
        },

        satisfaction_rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },


    })

const User = mongoose.model("User", userSchema)

export default User;
