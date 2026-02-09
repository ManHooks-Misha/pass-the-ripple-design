import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
    Users,
    BookOpen,
    Heart,
    Sparkles,
    Download,
    CheckCircle,
    School,
    Smile,
    ShieldCheck,
    HandHeart,
    Layout,
} from "lucide-react";
import waterPencilTexture from "@/assets/water-pencil-texture.png";
import WaterPencilButton from "@/components/ui/WaterPencilButton";
import WaterPencilCard from "@/components/ui/WaterPencilCard";
import WaterPencilTitle from '@/components/ui/WaterPencilTitle';
import FootprintPath from '@/components/ui/FootprintPath';

const ForTeachers = () => {
    return (
        <main className="min-h-screen font-teachers overflow-x-hidden bg-white text-[#2D3748]">
            <Seo
                title="For Teachers — Pass The Ripple"
                description="Bring belonging and kindness to your classroom with simple SEL tools. Designed for ages 4-8."
                canonical={`${window.location.origin}/teachers`}
            />
<div className="scroll-h" id="zoom-wrapper">
            {/* HERO */}
            <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-[#F0F9FF] to-[#E6FFFA]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left relative z-10">
                            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-sm mb-6 border border-blue-200">
                                For Educators (Grades K-3)
                            </div>
                            <div className="mb-6">
                                <WaterPencilTitle text="Bring Kindness to Your Classroom" className="justify-center md:justify-start" />
                            </div>
                            <p className="text-[18px] md:text-[20px] text-[#4A5568] leading-relaxed mb-8">
                                Simple tools to help every student see that their kindness matters and they belong. Also supports SEL goals with celebration, not competition.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start pt-4">
                                <WaterPencilButton href="/register?role=teacher" variant="blue" shape={1} className="w-[240px]">
                                    Create Teacher Account
                                </WaterPencilButton>
                                <WaterPencilButton href="#how-it-works" variant="blue" shape={2} className="w-[200px]">
                                    See How It Works
                                </WaterPencilButton>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="/assets/teachers/hero-classroom.jpg"
                                alt="Classroom kindness circle"
                                className="rounded-[2rem] shadow-2xl border-4 border-white w-full object-cover transform rotate-2 hover:rotate-0 transition-transform duration-500"
                            />
                            {/* Decorative blobs */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50 -z-10"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-50 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-24 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: `url(${waterPencilTexture})` }} />
                <div className="container mx-auto max-w-6xl px-4 relative z-10">
                    <div className="text-center mb-16">
                        <div className="mb-6">
                            <WaterPencilTitle text="How It Works (It's as easy as A–B–C)" variant="lite" className="justify-center" size="md" />
                        </div>
                        <p className="text-xl text-gray-600">Simple to integrate into your daily routine</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Decorative Footprint Path (Desktop) */}
                        <FootprintPath className="absolute inset-0 z-0" footprints={[
                            { top: "30%", left: "25%", rotation: -20, color: "#3b82f6", size: 34 },
                            { top: "50%", left: "32%", rotation: 15, color: "#22c55e", size: 38 },
                            { top: "25%", left: "58%", rotation: -10, color: "#a855f7", size: 36 },
                            { top: "55%", left: "65%", rotation: 25, color: "#ec4899", size: 38 },
                        ]} />

                        {/* A */}
                        <WaterPencilCard variant="blue" className="h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">A</div>
                                <h3 className="font-bold text-2xl text-[#2D3748]">Start Together</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden mb-6 border-4 border-white shadow-md">
                                <img src="/assets/teachers/how-it-works-start.jpg" alt="Start together" className="w-full h-auto object-cover" />
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Scan QR code with students</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Discuss what a "ripple" is</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Children under 13 need adult supervision</li>
                            </ul>
                        </WaterPencilCard>

                        {/* B */}
                        <WaterPencilCard variant="green" className="h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">B</div>
                                <h3 className="font-bold text-2xl text-[#2D3748]">Do One Small Act</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden mb-6 border-4 border-white shadow-md">
                                <img src="/assets/teachers/how-it-works-act.jpg" alt="Do acts of kindness" className="w-full h-auto object-cover" />
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Talk with students about kindness</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Help a friend, thank a helper</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Include someone new</li>
                            </ul>
                        </WaterPencilCard>

                        {/* C */}
                        <WaterPencilCard variant="purple" className="h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">C</div>
                                <h3 className="font-bold text-2xl text-[#2D3748]">Record & Reflect</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden mb-6 border-4 border-white shadow-md">
                                <img src="/assets/teachers/how-it-works-reflect.jpg" alt="Record and reflect" className="w-full h-auto object-cover" />
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-purple-500 shrink-0" /> Add ripple to the site</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-purple-500 shrink-0" /> Share feelings and impact</li>
                                <li className="flex gap-2 text-sm"><CheckCircle className="w-5 h-5 text-purple-500 shrink-0" /> Watch kindness grow</li>
                            </ul>
                        </WaterPencilCard>
                    </div>
                </div>
            </section>

            {/* SEL INTEGRATION - "Simple Ways to Use..." */}
            <section className="py-24 bg-[#EBF8FF]">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <h2 className="font-black text-[32px] md:text-[42px] text-[#2D3748] mb-6">
                                Simple Ways to Use Pass the Ripple
                            </h2>
                            <h2 className="text-2xl md:text-3xl text-blue-900 font-bold mb-6">
                                Social-Emotional Learning Made Magical
                            </h2>
                            <p className="text-xl text-blue-800 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                                Pass the Ripple seamlessly integrates into your daily routine, fostering a culture of kindness and empathy.
                            </p>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-xl text-blue-900 mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" /> Morning Meeting</h4>
                                    <p className="text-gray-600">Set a kindness intention for the day and brainstorm ripple ideas together.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-blue-900 mb-2 flex items-center gap-2"><HandHeart className="w-5 h-5 text-pink-500" /> End-of-Day Reflection</h4>
                                    <p className="text-gray-600">Ask what ripples students made and how they felt. Connect to SEL goals.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-blue-900 mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-green-500" /> Class Celebrations</h4>
                                    <p className="text-gray-600">Highlight collective classroom themes. Reinforce that everyone's kindness matters.</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="relative">
                                <img src="/assets/teachers/sel-moments.jpg" alt="SEL Moments in classroom" className="rounded-[2rem] shadow-2xl border-4 border-white w-full" />
                                {/* Badge overlay */}
                                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-blue-100 flex items-center gap-3">
                                    <Heart className="w-8 h-8 text-pink-500 fill-pink-100" />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Building Community</p>
                                        <p className="text-xs text-gray-500">One ripple at a time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEACHER DASHBOARD */}
            <section className="py-24 bg-white">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-black text-[32px] md:text-[42px] text-[#2D3748] mb-4">
                            Your Teacher Dashboard
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A simple, private space to manage your class and see collective kindness grow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div className="relative">
                            <img src="/assets/teachers/teacher-dashboard-preview.jpg" alt="Teacher Dashboard" className="rounded-xl shadow-2xl border border-gray-100 w-full" />
                        </div>
                        <div className="space-y-8">
                            <WaterPencilCard variant="purple" className="p-6">
                                <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                                    <Layout className="w-5 h-5" /> What You Can Manage
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 text-purple-800"><CheckCircle className="w-5 h-5 text-purple-600 shrink-0" /> Create class groups with simple join codes</li>
                                    <li className="flex gap-2 text-purple-800"><CheckCircle className="w-5 h-5 text-purple-600 shrink-0" /> Connect students to your classroom</li>
                                    <li className="flex gap-2 text-purple-800"><CheckCircle className="w-5 h-5 text-purple-600 shrink-0" /> Set optional challenges</li>
                                </ul>
                            </WaterPencilCard>
                            <WaterPencilCard variant="blue" className="p-6">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                                    <Smile className="w-5 h-5" /> What You Can See
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 text-blue-800"><CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> The kind acts your students log</li>
                                    <li className="flex gap-2 text-blue-800"><CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> Students' reflections (feelings/impact)</li>
                                    <li className="flex gap-2 text-blue-800"><CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> Aggregate patterns and themes</li>
                                </ul>
                            </WaterPencilCard>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
                        <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                            <Sparkles className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-yellow-900 text-lg">Important: Celebration over Ranking</h4>
                            <p className="text-yellow-800"> You'll see collective themes and classroom growth, NOT individual rankings. Pass the Ripple celebrates community kindness, not competition.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRIVACY & SAFETY */}
            <section className="py-24 bg-[#F7FAFC]">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-black text-[32px] md:text-[42px] text-[#2D3748] mb-6">
                                Privacy & Safety First
                            </h2>
                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-3 items-start">
                                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                    <span className="text-gray-700 font-medium">Children's activity is always supervised by a teacher or parent</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                    <span className="text-gray-700 font-medium">No last names, home addresses, or contact details required</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                    <span className="text-gray-700 font-medium">COPPA compliant for children under 13</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                    <span className="text-gray-700 font-medium">Students only see their own ripples and classroom celebrations</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <img src="/assets/teachers/privacy-safety.jpg" alt="Privacy Bubbles" className="rounded-xl w-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* SEL COMPETENCIES */}
            <section className="py-24 bg-white">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-16 text-center">
                <WaterPencilTitle 
                    text="Aligned with CASEL's Core SEL Competencies" 
                    variant="lite" 
                    className="justify-center mb-6" 
                    size="md" 
                />
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Our curriculum is built on the five core competencies that empower students to thrive academically, socially, and emotionally.
                </p>
                </div>
                
                <div className="relative mb-16">
                {/* Decorative background elements */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <div className="w-4/5 h-4/5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl blur-xl opacity-50"></div>
                </div>
                
                {/* Image with overlay content */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                        src="/assets/teachers/sel-competencies.jpg" 
                        alt="CASEL SEL Competencies Framework" 
                        className="w-full h-auto object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    
                    {/* Competencies positioned around the image */}
                    <div className="relative -mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Self-Awareness */}
                        <div className="relative group">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            </div>
                            <h5 className="font-bold text-orange-800 mb-2 text-lg">Self-Awareness</h5>
                            <p className="text-sm text-orange-700">Recognizing emotions, values & personal identity</p>
                        </div>
                        </div>

                        {/* Self-Management */}
                        <div className="relative group">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-green-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            </div>
                            <h5 className="font-bold text-green-800 mb-2 text-lg">Self-Management</h5>
                            <p className="text-sm text-green-700">Regulating emotions, managing stress & motivation</p>
                        </div>
                        </div>

                        {/* Social Awareness */}
                        <div className="relative group">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            </div>
                            <h5 className="font-bold text-purple-800 mb-2 text-lg">Social Awareness</h5>
                            <p className="text-sm text-purple-700">Developing empathy & understanding diverse perspectives</p>
                        </div>
                        </div>

                        {/* Relationship Skills */}
                        <div className="relative group">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.697a3.5 3.5 0 00-7 0 3.5 3.5 0 007 0z" />
                            </svg>
                            </div>
                            <h5 className="font-bold text-blue-800 mb-2 text-lg">Relationship Skills</h5>
                            <p className="text-sm text-blue-700">Building healthy relationships & communication skills</p>
                        </div>
                        </div>

                        {/* Decision Making */}
                        <div className="relative group">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-yellow-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4 mx-auto">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            </div>
                            <h5 className="font-bold text-yellow-800 mb-2 text-lg">Decision Making</h5>
                            <p className="text-sm text-yellow-700">Making ethical, constructive choices about behavior</p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                {/* Connecting lines visualization (for desktop) */}
                <div className="hidden lg:block relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-green-200 via-purple-200 via-blue-200 to-yellow-200 -translate-y-1/2 z-0"></div>
                <div className="relative flex justify-between z-10">
                    {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-white border-2 border-gray-200 rounded-full"></div>
                    ))}
                </div>
                </div>
            </div>
            </section>

            {/* RESOURCES/DOWNLOADS */}
            <section className="py-24 bg-[#FFFBEB]">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-black text-[32px] md:text-[42px] text-[#2D3748] mb-6">
                            Resources to Get You Started
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
                        <div className="order-2 md:order-1 grid gap-6">
                            {/* Card 1 */}
                            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-colors flex items-center gap-6 shadow-sm">
                                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                    <BookOpen className="w-7 h-7 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#2D3748] mb-1">Teacher Quick Start Guide</h4>
                                    <p className="text-sm text-gray-500 mb-2">Step-by-step setup & activities (PDF)</p>
                                    <button className="text-orange-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                        Download <Download className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors flex items-center gap-6 shadow-sm">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <Users className="w-7 h-7 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#2D3748] mb-1">Parent Letter</h4>
                                    <p className="text-sm text-gray-500 mb-2">Introduce Pass the Ripple to families (PDF)</p>
                                    <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                        Download <Download className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors flex items-center gap-6 shadow-sm">
                                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                    <Sparkles className="w-7 h-7 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#2D3748] mb-1">Classroom Posters</h4>
                                    <p className="text-sm text-gray-500 mb-2">Kindness prompts for your walls (PDF)</p>
                                    <button className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                        Download <Download className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <img src="/assets/teachers/resources-preview.jpg" alt="Resources Preview" className="w-full rounded-xl shadow-lg rotate-2 hover:rotate-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 text-center relative overflow-hidden text-white">
                <div className="absolute inset-0 z-0">
                    <img src="/assets/teachers/cta-background.jpg" alt="Join the movement" className="w-full h-full object-cover brightness-75" />
                    <div className="absolute inset-0 bg-[#3182CE] mix-blend-multiply opacity-60"></div>
                </div>

                <div className="container mx-auto max-w-4xl px-4 relative z-10">
                    <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold text-sm mb-6 border border-white/30 text-white">
                        Join the Community
                    </div>
                    <h2 className="font-black text-[36px] md:text-[56px] leading-tight mb-8">
                        Ready to Bring Ripples to Your Class?
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center gap-8">
                        <WaterPencilButton href="/register?role=teacher" variant="blue" className="w-[260px]">
                            Create Teacher Account
                        </WaterPencilButton>
                        <WaterPencilButton href="/contact-us" variant="blue" className="w-[220px]">
                            Schedule a Demo
                        </WaterPencilButton>
                    </div>
                </div>
            </section>
</div>
        </main>
    );
};

export default ForTeachers;
