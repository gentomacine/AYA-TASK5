export const userRegisterController = async (req, res) => {
    const { firstname, lastname, email, password } = req.body
    const foundUser = await User.findOne({ email });
    try {
        //check if user already registered

        if (foundUser) {
            return res.json({ message: "user already exist" })
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const passwordhash = await bcrypt.hash(password, salt)
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: passwordhash,

        })
        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.json(error.message)
    }

}
//login user

export const userLoginController = async (req, res) => {
    const { email, password } = req.body;
    //console.log(req.headers);
    try {
        const foundUser = await User.findOne({ email });


        if (!foundUser) {
            return res.json({
                status: "error",
                message: "invalid email login details"
            })
        }
        const foundPassword = await bcrypt.compare(password, foundUser.password);

        if (!foundPassword) {
            return res.json({ status: "error", message: "invalid login details" })
        } else {


            res.json({
                status: "success",
                data: {
                    firstname: foundUser.firstname,
                    lastname: foundUser.lastname,
                    email: foundUser.email,
                    token: generateToken(foundUser._id)
                },
            })
        }
    } catch (error) {
        res.json(error.message)
    }

}


//user profile
export const userIdController = async (req, res) => {
    const { id } = req.params;
    try {
        //const token = obtainTokenFromHeader(req)
        // console.log(token);
        console.log(req, userAuth);
        const foundUser = await User.findById(req.userAuth);
        if (foundUser) {
            res.json({
                status: "success",
                data: { foundUser }
            });
        } else {
            res.json({
                status: "success",
                data: " user with such id doesnt exist"
            });
        }

    } catch (error) {
        res.json(error.message)
    }

}

//user subscription
function connectUserToSubscription(email, password) {
    return User.findOne({ email, password })
        .then(user => {
            if (!user) {
                throw new Error('Invalid email or password');
            }
            const { subscription_plan, subsription_start_date, subsription_end_date } = user;
            let subscriptionStatus;
            if (!subsription_end_date) {
                subscriptionStatus = 'cancelled';
            } else if (subsription_end_date < new Date()) {
                subscriptionStatus = 'lapsed';
            } else {
                subscriptionStatus = 'active';
                const remainingDays = Math.ceil((subsription_end_date - new Date()) / (1000 * 60 * 60 * 24));
                console.log(`Your subscription is active with ${remainingDays} days remaining`);
            }
            if (subscriptionStatus === 'lapsed' || subscriptionStatus === 'cancelled') {
                console.log('Your subscription has lapsed or been cancelled. Please renew to continue.');
                // implement renew subscription logic
            }
            if (subscriptionStatus === 'cancelled') {
                user.subscription_plan = null;
                user.subsription_start_date = null;
                user.subsription_end_date = null;
                return user.save();
            }
            return user;
        });
}

//tracking user activity

function trackUserActivity(user) {
    const now = new Date();

    // Update last login time
    user.last_login = now;

    // Calculate time since last login
    const timeSinceLastLogin = now - user.updated_at;

    // If the user has not logged in before, set time spent to 0
    if (!user.time_spent) {
        user.time_spent = 0;
    }

    // If the user has been inactive for more than a day, reset their time spent to 0
    if (timeSinceLastLogin >= 86400000) { // 1 day in milliseconds
        user.time_spent = 0;
    }

    // Calculate time spent on platform during this session
    const timeSpentThisSession = now - user.last_activity;

    // Add time spent this session to total time spent
    user.time_spent += timeSpentThisSession;

    // Update last activity time
    user.last_activity = now;

    // Increment login count
    user.login_count++;

    // Save user object to database
    user.save();
}


// Get the number of tickets submitted by the user
Ticket.countDocuments({ user: userId })
    .then(count => {
        console.log(`Number of tickets submitted by the user: ${count}`);
    })
    .catch(error => {
        console.error(error);
    });

// Get the average time taken to resolve tickets submitted by the user
Ticket.aggregate([
    { $match: { user: userId, status: 'closed' } },
    { $group: { _id: null, averageTimeTaken: { $avg: { $subtract: ['$closedAt', '$createdAt'] } } } }
])
    .then(results => {
        if (results.length > 0) {
            console.log(`Average time taken to resolve tickets submitted by the user: ${results[0].averageTimeTaken}`);
        } else {
            console.log('No closed tickets found for the user');
        }
    })
    .catch(error => {
        console.error(error);
    });

// Get the satisfaction ratings of the user for all their tickets
Ticket.find({ user: userId, satisfactionRating: { $exists: true } }, { satisfactionRating: 1 })
    .then(tickets => {
        if (tickets.length > 0) {
            const ratings = tickets.map(ticket => ticket.satisfactionRating);
            const averageRating = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
            console.log(`Satisfaction ratings of the user: ${ratings}`);
            console.log(`Average satisfaction rating of the user: ${averageRating}`);
        } else {
            console.log('No tickets with satisfaction ratings found for the user');
        }
    })
    .catch(error => {
        console.error(error);
    });
