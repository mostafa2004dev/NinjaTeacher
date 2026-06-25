import React from 'react'
import { createBrowserRouter } from 'react-router'
import MainLayout from '../component/layout/MainLayout/MainLayout'
import Profile from "../pages/profile/Profile"
import Home from "../pages/Home/home2/Home"
import Notfound from "../pages/Notfound/Notfound"
import Login from "../pages/Auth/login/login"
import Register from "../pages/Auth/register/register"
import AuthLayout from '../component/layout/AuthLayout/AuthLayout'
import Protectedroute from './Protectedroute'
import Authroutes from './Authroutes'
import PostDetails from '../pages/postDetails/postDetails'
import Welcome from '../pages/Auth/HowItWork/Welcome'
import SchoolPortal from '../pages/SchoolPortal/SchoolPortal'
import Notification from '../pages/notification/Notification'
import TermOfService from '../pages/TermOfService/TermsOfServicePage'
import PrivacyPage from '../pages/privacy/PrivacyPage'
import ContactPage from '../pages/contact/ContactPage'
import TeacherDashboard from '../pages/TeacherPortal/TeacherDashboard'
import BrowseJobs from '../pages/TeacherPortal/BrowseJobs'
import ApplyJobs from '../pages/TeacherPortal/ApplyJob'
import SuccessPage from '../pages/TeacherPortal/SuccessPage'
import TeacherProfile from '../pages/TeacherPortal/TeacherProfile'
import JobDetails from '../pages/TeacherPortal/JobDetails'
import SurveyCompleted from '../pages/Home/home2/SurveyCompleted'
import TeacherSurvey from '../pages/Home/home2/TeacherSurvey'
import School from '../pages/SchoolProfile/school'
import About from '../pages/Aboutus/about'
import Payment from '../pages/payment/Payment'
import Admin from '../pages/Admin/Admin'
import AdminLogin from '../pages/Auth/admin-login/AdminLogin'
import ForgotPassword from '../pages/Auth/forgot-password/ForgotPassword'
import AccountSettings from '../pages/settings/AccountSettings'
import Recommendations from '../pages/TeacherPortal/Recommendations'
export const router = createBrowserRouter([
    {
        path: "",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element:
                    <Protectedroute>
                        <Home />

                    </Protectedroute>

            },

            {
                path: "SchoolProfile",
                element:
                    <Protectedroute allowedRoles={["school"]}>

                        <School></School>
                    </Protectedroute>

            }, {
                path: "SchoolDashpord",
                element:
                    <Protectedroute allowedRoles={["school"]}>

                        <SchoolPortal></SchoolPortal>
                    </Protectedroute>

            }, {
                path: "settings",
                element:
                    <Protectedroute>

                        <AccountSettings></AccountSettings>
                    </Protectedroute>

            },
            {
                path: "TeacherSurvey",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>

                        <TeacherSurvey></TeacherSurvey>
                    </Protectedroute>

            },
            {
                path: "Survey-Complete",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>

                        <SurveyCompleted></SurveyCompleted>
                    </Protectedroute>

            },
            {
                path: "TeacherPortal",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>

                        <TeacherDashboard></TeacherDashboard>
                    </Protectedroute>

            },
            {
                path: "TeacherProfile",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>

                        <TeacherProfile></TeacherProfile>
                    </Protectedroute>

            }, {
                path: "browse-jobs",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>

                        <BrowseJobs>
                        </BrowseJobs>
                    </Protectedroute>

            }, {
                path: "recommendations",
                element:
                    <Protectedroute allowedRoles={["teacher"]}>
                        <Recommendations />
                    </Protectedroute>
            }, {
                path: "Admin",
                element:
                    <Protectedroute allowedRoles={["super_admin", "admin"]}>

                        <Admin></Admin>
                    </Protectedroute>

            }, {
                path: "payment",
                element:
                    <Protectedroute>

                        <Payment></Payment>
                    </Protectedroute>

            }, {
                path: "JobDetails",
                // /:userId
                element:
                    <Protectedroute>
                        <JobDetails></JobDetails>
                    </Protectedroute>
            },
            {
                path: "ApplyJob",
                element:
                    <Protectedroute>

                        <ApplyJobs></ApplyJobs>
                    </Protectedroute>

            },
            {
                path: "success",
                element:
                    <Protectedroute>

                        <SuccessPage></SuccessPage>
                    </Protectedroute>

            },

            {
                path: "contact",
                element:


                    <ContactPage></ContactPage>


            },
            {
                path: "terms",
                element:


                    <TermOfService></TermOfService>


            },
            {
                path: "privacy",
                element:

                    <PrivacyPage></PrivacyPage>


            },
            {
                path: "about",
                element:

                    <About></About>


            },
            {
                path: "Notifications",
                element:
                    <Protectedroute>

                        <Notification />
                    </Protectedroute>

            },
            {
                path: "profile",
                // /:userId
                element:
                    <Protectedroute>
                        <Profile />
                    </Protectedroute>
            },
            {
                path: "post-deatils/:postid",
                element:
                    <Protectedroute>
                        <PostDetails />
                    </Protectedroute>
            },
            {
                path: "*",
                element: <Notfound />
            }

        ]



    },
    {
        path: "",
        element: <AuthLayout />,
        children: [{

            path: "welcome",
            element:
                <Authroutes>
                    <Welcome />
                </Authroutes>

        }, {
            path: "login",
            element:
                <Authroutes>
                    <Login />
                </Authroutes>

        }, {
            path: "register",
            element: <Authroutes>
                <Register />
            </Authroutes>

        }, {
            path: "admin-login",
            element: <Authroutes>
                <AdminLogin />
            </Authroutes>

        }, {
            path: "forgot-password",
            element: <Authroutes>
                <ForgotPassword />
            </Authroutes>

        }
        ]
    }

])
