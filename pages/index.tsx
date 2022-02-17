import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Router from "next/router";

import { Fragment, useState, useEffect } from "react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import {
  LockClosedIcon,
} from "@heroicons/react/outline";
import {
  XIcon,
  UserIcon,
  ChevronRightIcon,
  DotsVerticalIcon,
  SearchIcon,
  PencilIcon,
  DocumentTextIcon,
} from "@heroicons/react/solid";

import { supabase } from "../utils/supabaseClient";

import { Radar } from 'react-chartjs-2';

interface Skill{
  name: string;
  current: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Home: NextPage = () => {
  const [id, setId] = useState<any>(null);
  const [skills, setSkills] = useState([
    { 
      name: "Category 1", 
      current: true,
      categories: [
        {
          name: "Skill",
          grade: 3,
        }
      ],
    },
  ])
  const [open, setOpen] = useState(true);
  const [formId, setFormId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState<any>(null);
  const [secret, setSecret] = useState<string>("");
  const [form, setForm] = useState<boolean>(false);
  const [view, setView] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [existingId, setExistingId] = useState<any>("");
  const [feedbacks, setFeedbacks] = useState<any>(null);
  const [name, setName] = useState<string>("Category 1");
  const [existing, setExisting] = useState<boolean>(true);
  const [applications, setApplications] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const admin = () => {
    if(existingId === "5O#@XH!8$t"){
      Router.push("/admin");
    }
    else{
      alert("Your ID has not been verified as an admin user.")
    }
  }

  const verification = async () => {
    try{
      const { data, error } = await supabase.from("users").select()
      if(error){
        throw error;
      }
      if(data){
        if(existing){
          let exist;
          data.forEach((user) => {
            if(user.uuid === id){
              exist = true;
            }
          })
          if(exist){
            alert(id + " already exists in our database. Try generating a new ID by toggling between existing ID");
          }
          else{
            try{
              const { data, error } = await supabase.from("users").insert([
                {
                  uuid: id,
                  secret: secret,
                }
              ]);
              if(error){
                throw error;
              }
              setSecret("");
              setOpen(false);
              setExistingId(id);
              setExisting(false);
              localStorage.setItem("id", id)
            }
            catch(error: any){
              alert(error.message);
            }
          }
        }
        else{
          let successID = false;
          let successSecret = false;
          data.forEach((user) => {
            if(user.uuid === existingId){
              successID = true;
            }
            if(user.secret === secret){
              successSecret = true;
            }
          })
          if(successID && successSecret){
            setSecret("");
            setOpen(false);
            localStorage.setItem("id", existingId)
          }
          else{
            if(!successID){
              alert(existingId + " was not found in the database. Please try again");
            }
            else{
              alert(secret + " did not match any corresponding ID. Please try again");
            }
          }
        }
      }
    }
    catch(error: any){
      alert(error.message);
    }
  }

  const generateString = (length: number) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#£$&/?^*~|-';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const fetchApplications = async () => {
    try{
      const { data, error } = await supabase.from("applications").select().order('active', { ascending: false })
      if(error){
        throw error;
      }
      setApplications(data)
    }
    catch(error: any){
      alert(error.message)
    }
  }

  const fetchFeedbacks = async (id: string, feedbacks: any) => {
    setData(null);
    try{
      const { data, error } = await supabase.from("feedbacks").select().match({form_id: id}).order('id', { ascending: true })
      if(error){
        throw error;
      }
      if(data){
        let labels = [] as any[];
        let datasets = [] as any[];
        let assesors = [] as any[];
        if(feedbacks){
          feedbacks.forEach((skill: any) => {
            if(skill.form_id === id){
              skill.categories.forEach((category: any) => {
                labels.push(category.name);
              })
            }
          })
          applications.forEach((application: any) => {
            if(application.form_id === id){
              application.assesors.forEach((assesor: any) => {
                assesors.push(assesor);
              })
            }
          })
          assesors.forEach((assesor: any, index: number) => {
            const bg = [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ]
            const border = [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ]
            const grade = [] as any;
            data.forEach((feedback: any) => {
              if(feedback.user_id === assesor){
                const categories = JSON.parse(feedback.categories);
                categories.forEach((item: any) => {
                  grade.push(parseInt(item.grade));
                })
              }
            })
            datasets.push({
              label: "Assesor " + (index + 1),
              data: grade,
              backgroundColor: [bg[index]],
              borderColor: [border[index]],
              borderWidth: 1
            })
          })
          setData({
            labels: labels,
            datasets: datasets
          })
          console.log(labels);
          console.log(datasets)
        }
      }
    }
    catch(error: any){
      alert(error.message);
    }
  }

  const fetchSkills = async (id: string) => {
    setFeedbacks(null);
    try{
      const { data, error } = await supabase.from("skills").select().match({form_id: id}).order('id', { ascending: true })
      if(error){
        throw error;
      }
      if(data){
        const list = data;
        list.forEach((item, index) => {
          if(index){
            item.current = false;
          }
          else{
            item.current = true;
          }
          item.categories = JSON.parse(item.categories);
        })
        setFeedbacks(list);
        fetchFeedbacks(id, list);
      }
    }
    catch(error: any){
      alert(error.message)
    }
  }

  useEffect(() => {
    fetchApplications();
    //https://www.programiz.com/javascript/examples/generate-random-strings
    const result = generateString(10);
    setId(result);
    if(localStorage.getItem("id")){
      setExisting(false)
      setExistingId(localStorage.getItem("id"))
    }
    else{
      localStorage.setItem("id", result);
    }
  }, [])

  const activeSkill = (id: number) => {
    const list = [...skills];
    list.forEach((item, index) => {
      if(id === index){
        setName(item.name);
        item.current = true;
      }
      else{
        item.current = false;
      }
    })
    setSkills(list);
  }

  const activeFeedback = (id: number) => {
    const list = [...feedbacks];
    list.forEach((item, index) => {
      if(id === index){
        item.current = true;
      }
      else{
        item.current = false;
      }
    })
    setFeedbacks(list);
  }

  const changeSkill = (skill: string) => {
    let active;
    const list = [...skills];
    list.forEach((item) => {
      if(item.current){
        item.name = skill;
      }
    })
    setSkills(list);
  }

  const addSkill = (event: any) => {
    event.preventDefault();
    const list = [...skills];
    list.forEach((item: Skill) => {
      item.current = false;
    })
    setName("Category " + (list.length + 1));
    list.push({
      name: "Category " + (list.length + 1),
      current: true,
      categories: [
        {
          name: "Skill",
          grade: 3,
        }
      ],
    })
    setSkills(list);
  }

  const deleteSkill = () => {
    const list = [...skills];
    if(list.length === 1) return;
    list.pop();
    list[list.length - 1].current = true;
    setName(list[list.length - 1].name);
    setSkills(list);
  }

  const submitSkill = async () => {
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const form_id = generateString(15);
    try{
      const { data, error } = await supabase.from("applications").insert([
        {
          user_id: existingId,
          form_id: form_id,
          assesors: [],
          totalAssesors: 0,
          lastUpdated: months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
          active: true,
        }
      ]);
      if(error){
        throw error;
      }
      try{
        const { data, error } = await supabase.from("activities").insert([
          {
            user: existingId,
            activity: "created a new application",
            date: months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
            application: form_id,
          }
        ]);
        if(error){
          throw error;
        }
      }
      catch(error: any){
        alert(error.message);
      }
      skills.forEach(async (skill) => {
        try{
          const { data, error } = await supabase.from("skills").insert([
            {
              name: skill.name,
              categories: JSON.stringify(skill.categories),
              user_id: existingId,
              form_id: form_id
            }
          ]);
          if(error){
            throw error;
          }
        }
        catch(error: any){
          alert(error.message);
        }
      })
      setSkills([
        { 
          name: "Category 1", 
          current: true,
          categories: [
            {
              name: "Skill",
              grade: 3,
            }
          ],
        },
      ])
      setForm(false);
      fetchApplications();
    }
    catch(error: any){
      alert(error.message);
    }
  }

  const submitFeedback = async () => {
    let application: any;
    let list = [...applications]
    list.forEach((item) => {
      if(item.form_id === formId){
        if(!item.assesors.includes(existingId)){
          if(item.totalAssesors < 4){
            item.assesors.push(existingId);
          }
          item.totalAssesors += 1;
          application = item;
        }
      }
    });
    if(application){
      const date = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
      feedbacks.forEach(async (feedback: any) => {
        try{
          const { data, error } = await supabase.from("feedbacks").insert([
            {
              name: feedback.name,
              categories: JSON.stringify(feedback.categories),
              user_id: existingId,
              form_id: formId
            }
          ]);
          if(error){
            throw error;
          }
        }
        catch(error: any){
          alert(error.message);
        }
      })
      try{
        const { data, error } = await supabase.from("applications").update([
          {
            form_id: application.form_id,
            assesors: application.assesors,
            totalAssesors: application.totalAssesors,
            lastUpdated: months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
            user_id: application.user_id
          },
        ]).match({ form_id: formId });
        if(error){
          throw error;
        }
        try{
          const { data, error } = await supabase.from("activities").insert([
            {
              user: existingId,
              activity: "graded an application",
              date: months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
              application: application.form_id,
            }
          ]);
          if(error){
            throw error;
          }
        }
        catch(error: any){
          alert(error.message);
        }
        setView(false);
        setFeedbacks(null);
      }
      catch(error: any){
        alert(error.message);
      }
    }
    else{
      alert("You're only allowed to submit once per application");
    }
  }

  const addCategory = () => {
    const list = [...skills];
    list.forEach((item) => {
      if(item.current){
        item.categories.push({
          name: "Skill",
          grade: 3,
        })
      }
    })
    setSkills(list)
  }

  const changeCategory = (category: string, id: number) => {
    const list = [...skills];
    list.forEach((item) => {
      if(item.current){
        item.categories[id].name = category;
      }
    })
    setSkills(list);
  }

  const changeFeedback = (grade: string, id: number) => {
    const list = [...feedbacks];
    list.forEach((item) => {
      if(item.current){
        item.categories[id].grade = grade;
      }
    })
    setFeedbacks(list);
  }

  const deleteCategory = (id: number) => {
    const list = [...skills];
    list.forEach((item) => {
      if(item.current && item.categories.length > 1){
        item.categories.splice(id, 1);
      }
    })
    setSkills(list);
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, minimum-scale=1"
        />
      </Head>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={() => {}}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <form onSubmit={(e) => {e.preventDefault(); verification()}} className="inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all align-middle w-96">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <PencilIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                      {existing ? "ID" : "Existing ID"}
                    </label>
                    <div className="mt-2">
                      <input
                        id="id"
                        name="id"
                        type="text"
                        autoComplete="id"
                        disabled={existing}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={existing ? (id) : (existingId)}
                        onChange={(e) => {existing ? (setId(e.target.value)) : (setExistingId(e.target.value))}}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                      Secret word
                    </label>
                    <div className="mt-2">
                      <input
                        id="id"
                        name="id"
                        type="text"
                        autoComplete="id"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-7 flex">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-2 px-4 border-2 border-transparent rounded-l-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none"
                  >
                    Save
                  </button>
                  {
                    existing ? (
                      <button
                        type="button"
                        className="w-full flex items-center justify-center py-2 px-4 border-2 border-green-500 rounded-r-md shadow-sm text-sm font-medium text-green-500 focus:outline-none"
                        onClick={() => setExisting(false)}
                      >
                        Use an existing ID
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full flex items-center justify-center py-2 px-4 border-2 border-green-500 rounded-r-md shadow-sm text-sm font-medium text-green-500 focus:outline-none"
                        onClick={() => {setExisting(true); setId(generateString(10))}}
                      >
                        Use a new ID
                      </button>
                    )
                  }
                </div>
              </form>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {form ? (
        <div className="min-h-full">
          <main className="py-10">
            {/* Page header */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
              <div className="flex items-center space-x-5">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <UserIcon
                      className="h-16 w-16 rounded-full text-green-500"
                    />
                    <span
                      className="absolute inset-0 shadow-inner rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {existingId}
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Don't forget to save your ID for futher use.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                  onClick={() => setForm(false)}
                >
                  Go back
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                  onClick={submitSkill}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="mt-8 max-w-3xl mx-auto gap-6 sm:px-6 lg:max-w-7xl">
              <div className="space-y-6">
                {/* Description list*/}
                <section aria-labelledby="applicant-information-title">
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2
                        id="applicant-information-title"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        Form
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Create a new application for assesors to evaluate your skills
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6 flex flex-col justify-center">
                      <div className="block overflow-x-auto text-green-500">
                        <ol role="list" className="flex items-center space-x-4">
                          {skills.map((item: any, index: number) => (
                            <li key={index}>
                              <div className="flex items-center">
                                {
                                  index ? (
                                    <svg
                                      className="flex-shrink-0 h-5 w-5 text-gray-300"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      aria-hidden="true"
                                    >
                                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                  ) : null
                                }
                                <button
                                  className={`${index ? ("ml-4") : null} ${item.current ? ("font-semibold border-b-2 border-green-500 text-green-500") : null} text-sm font-medium text-gray-500`}
                                  onClick={() => activeSkill(index)}
                                >
                                  {item.name}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 w-full">
                        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                          <div className="bg-white py-8 sm:rounded-lg sm:px-10">
                            <form className="space-y-6" onSubmit={addSkill}>
                              <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                  Name
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={name}
                                    onChange={(e) => {setName(e.target.value); changeSkill(e.target.value)}}
                                  />
                                </div>
                              </div>

                              {
                                skills.map((skill: any, index: number) => (
                                  <div key={index}>
                                    {
                                      skill.current ? (
                                        skill.categories.map((category: any, index: number) => (
                                          <div key={index} className="my-6">
                                            <label htmlFor={`category ${index}`} className="block text-sm font-medium text-gray-700">
                                              {category.name}
                                            </label>
                                            <div className="mt-1 flex items-center">
                                              <input
                                                id={`category ${index}`}
                                                name="category"
                                                type="text"
                                                autoComplete="category"
                                                className="appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                value={category.name}
                                                onChange={(e) => changeCategory(e.target.value, index)}
                                              />
                                              <span onClick={() => deleteCategory(index)} className="w-1/4 border border-transparent bg-green-500 rounded-r-md py-2.5 sm:py-2 flex items-center justify-center cursor-pointer hover:bg-green-600"><XIcon className="w-5 h-5 text-white"/></span>
                                            </div>
                                          </div>
                                        ))
                                      ) : null
                                    }
                                  </div>
                                ))
                              }

                              <div className="py-2">
                                <button
                                  type="button"
                                  className="w-full flex justify-center py-2 px-4 border-2 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none"
                                  onClick={addCategory}
                                >
                                  Add Skill
                                </button>
                              </div>

                              <div className="flex">
                                <div className="w-full">
                                  <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border-2 border-transparent rounded-l-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none"
                                  >
                                    Add category
                                  </button>
                                </div>
                                <div className="w-full">
                                  <button
                                    type="button"
                                    className="w-full flex justify-center py-2 px-4 border-2 border-green-500 text-green-500 rounded-r-md shadow-sm text-sm font-medium text-white focus:outline-none"
                                    onClick={deleteSkill}
                                  >
                                    Delete category
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          {view ? (
            <div className="min-h-full">
              <main className="py-10">
                {/* Page header */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <DocumentTextIcon
                          className="h-16 w-16 rounded-full text-green-500 p-1.5"
                        />
                        <span
                          className="absolute inset-0 shadow-inner rounded-full"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 pl-2">
                        {formId}
                      </h1>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                      onClick={() => setView(false)}
                    >
                      Go back
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                      onClick={submitFeedback}
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-8 max-w-3xl mx-auto gap-6 sm:px-6 lg:max-w-7xl">
                  <div className="space-y-6">
                    {/* Description list*/}
                    {
                      existingId === userId ? (
                        <section aria-labelledby="applicant-information-title">
                          <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                              <h2
                                id="applicant-information-title"
                                className="text-lg leading-6 font-medium text-gray-900"
                              >
                                Chart
                              </h2>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                View how other assesors have graded on this application
                              </p>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 flex flex-col items-center justify-center w-full h-96 text-green-500">
                              {
                                data ? (
                                  <Radar 
                                    data={data}
                                    options={{ 
                                      maintainAspectRatio: false,
                                    }}
                                  />
                                ) : null
                              }
                            </div>
                          </div>
                        </section>
                      ) : (
                        <section aria-labelledby="applicant-information-title">
                          <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                              <h2
                                id="applicant-information-title"
                                className="text-lg leading-6 font-medium text-gray-900"
                              >
                                Give feedback
                              </h2>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Fill in the application to help grade the participant
                              </p>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 flex flex-col justify-center">
                              <div className="block overflow-x-auto text-green-500">
                                <ol role="list" className="flex items-center space-x-4">
                                  {feedbacks && (feedbacks.map((item: any, index: number) => (
                                    <li key={index}>
                                      <div className="flex items-center">
                                        {
                                          index ? (
                                            <svg
                                              className="flex-shrink-0 h-5 w-5 text-gray-300"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                              aria-hidden="true"
                                            >
                                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                            </svg>
                                          ) : null
                                        }
                                        <button
                                          className={`${index ? ("ml-4") : null} ${item.current ? ("font-semibold border-b-2 border-green-500 text-green-500") : null} text-sm font-medium text-gray-500`}
                                          onClick={() => activeFeedback(index)}
                                        >
                                          {item.name}
                                        </button>
                                      </div>
                                    </li>
                                  )))}
                                </ol>
                              </div>
                              <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 w-full">
                                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                                  <div className="bg-white py-8 sm:rounded-lg sm:px-10">
                                    <form className="space-y-6">
                                      {
                                        feedbacks && (feedbacks.map((feedback: any, index: number) => (
                                          <div key={index}>
                                            {
                                              feedback.current ? (
                                                <>
                                                  {
                                                    feedback.categories.map((category: any, index: number) => (
                                                      <div key={index} className="my-6">
                                                        <label htmlFor={`category ${index}`} className="block text-sm font-medium text-gray-700">
                                                          {category.name}
                                                        </label>
                                                        <div className="mt-1 flex-col items-center">
                                                          <input
                                                            id={`category ${index}`}
                                                            name="category"
                                                            type="range"
                                                            max="5"
                                                            min="0"
                                                            autoComplete="category"
                                                            className="block w-full py-2 border border-transparent rounded-md placeholder-gray-400 focus:outline-none focus:ring-transparent focus:border-transparent sm:text-sm"
                                                            required
                                                            value={category.grade}
                                                            onChange={(e) => changeFeedback(e.target.value, index)}
                                                          />
                                                          <div className="grid grid-cols-6 gap-16 px-0.5 font-sora text-xs">
                                                            <span>0</span>
                                                            <span>1</span>
                                                            <span>2</span>
                                                            <span>3</span>
                                                            <span>4</span>
                                                            <span>5</span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ))
                                                  }
                                                </>
                                              ) : null
                                            }
                                          </div>
                                        )))
                                      }
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      )
                    }
                  </div>
                </div>
              </main>
            </div>
          ) : (
            <div className="min-h-full">
              <main className="py-10">
                {/* Page header */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                  <div className="flex items-center space-x-5 w-full">
                    <div className="flex-1 flex">
                      <form className="w-full flex md:ml-0" onSubmit={(e) => {e.preventDefault()}}>
                        <label htmlFor="search-field" className="sr-only">
                          Search
                        </label>
                        <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <input
                            id="search-field"
                            name="search-field"
                            className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:text-sm"
                            placeholder="Search"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                      onClick={admin}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500"
                      onClick={() => setForm(true)}
                    >
                      Create
                    </button>
                  </div>
                </div>

                <div className="mt-8 max-w-3xl mx-auto gap-6 sm:px-6 lg:max-w-7xl">
                  <div className="space-y-6">
                    {/* Description list*/}
                    <section aria-labelledby="applicant-information-title">
                      <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 mt-6 py-6 sm:px-6 lg:px-8">
                          <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                            ID TRACKER
                          </h2>
                          <ul
                            role="list"
                            className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4 mt-3"
                          >
                            <li className="relative col-span-1 flex shadow-sm rounded-md">
                              <div className="flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md bg-green-500">
                                ID
                              </div>
                              <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md">
                                <div className="flex-1 px-4 py-2 text-sm truncate">
                                  <a
                                    href="#"
                                    className="text-gray-900 font-medium hover:text-gray-600"
                                  >
                                    {existing ? (id) : (existingId)}
                                  </a>
                                  <p className="text-gray-500">
                                    Don't forget to save your ID
                                    <br />
                                    for futher use.
                                  </p>
                                </div>
                                <Menu as="div" className="flex-shrink-0 pr-2">
                                  <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                    <span className="sr-only">Open options</span>
                                    <DotsVerticalIcon
                                      className="w-5 h-5"
                                      aria-hidden="true"
                                    />
                                  </Menu.Button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <Menu.Items className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none">
                                      <div className="py-1">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              onClick={() => setOpen(true)}
                                              className={classNames(
                                                active
                                                  ? "bg-gray-100 text-gray-900"
                                                  : "text-gray-700",
                                                "block px-4 py-2 text-sm w-full text-left"
                                              )}
                                            >
                                              Edit
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="border-t border-gray-200 flex flex-col text-green-500">
                          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                            <div className="mt-10 sm:hidden">
                              <div className="px-4 sm:px-6">
                                <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                  Applications
                                </h2>
                              </div>
                              <ul
                                role="list"
                                className="mt-3 border-t border-gray-200 divide-y divide-gray-100"
                              >
                                {applications && (applications.map((application: any) => (
                                  <>
                                    {
                                      application.form_id.includes(search) ? (
                                        <li key={application.id}>
                                          <span
                                            className="group flex items-center justify-between px-4 py-6 hover:bg-gray-50 sm:px-6 cursor-pointer"
                                            onClick={() => {setView(true); setFormId(application.form_id); setUserId(application.user_id); fetchSkills(application.form_id)}}
                                          >
                                            <span className="flex items-center">
                                              {
                                                application.active ? (
                                                  <>
                                                    <span
                                                      className="w-2 h-2 flex-shrink-0 rounded-full bg-green-300"
                                                      aria-hidden="true"
                                                    />
                                                    <span
                                                      className="w-2 h-2 flex-shrink-0 rounded-full bg-green-300 absolute motion-safe:animate-ping"
                                                      aria-hidden="true"
                                                    />
                                                  </>
                                                ) : (
                                                  <>
                                                    <span
                                                      className="w-2 h-2 flex-shrink-0 rounded-full bg-gray-300"
                                                      aria-hidden="true"
                                                    />
                                                    <span
                                                      className="w-2 h-2 flex-shrink-0 rounded-full bg-gray-300 absolute motion-safe:animate-ping"
                                                      aria-hidden="true"
                                                    />
                                                  </>
                                                )
                                              }
                                              
                                              <span className="font-medium truncate text-gray-600 text-sm leading-6 ml-4">
                                                {application.form_id} <br/>
                                              </span>
                                            </span>
                                            <ChevronRightIcon
                                              className="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        </li>
                                      ) : null
                                    }
                                  </>
                                )))}
                              </ul>
                            </div>

                            {/* Projects table (small breakpoint and up) */}
                            <div className="hidden mt-8 sm:block">
                              <div className="align-middle inline-block min-w-full border-b border-gray-200">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="border-t border-gray-200">
                                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <span className="lg:pl-2">Applications</span>
                                      </th>
                                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assesors
                                      </th>
                                      <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last updated
                                      </th>
                                      <th className="pr-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" />
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {applications && (applications.map((application: any) => (
                                      <>
                                        {
                                          application.form_id.includes(search) ? (
                                            <tr key={application.id}>
                                              <td className="p-6 max-w-0 w-full whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center lg:pl-2">
                                                  {
                                                    application.active ? (
                                                      <>
                                                        <div
                                                          className="w-2 h-2 rounded-full bg-green-300"
                                                          aria-hidden="true"
                                                        />
                                                        <div
                                                          className="w-2 h-2 rounded-full bg-green-300 absolute motion-safe:animate-ping"
                                                          aria-hidden="true"
                                                        />
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div
                                                          className="w-2 h-2 rounded-full bg-gray-300"
                                                          aria-hidden="true"
                                                        />
                                                        <div
                                                          className="w-2 h-2 rounded-full bg-gray-300 absolute motion-safe:animate-ping"
                                                          aria-hidden="true"
                                                        />
                                                      </>
                                                    )
                                                  }
                                                  <span
                                                    className="truncate hover:text-gray-600 ml-6 cursor-pointer"
                                                    onClick={() => {setView(true); setFormId(application.form_id); setUserId(application.user_id); fetchSkills(application.form_id)}}
                                                  >
                                                    <span className="text-gray-600">
                                                      {application.form_id} <br />
                                                    </span>
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="px-6 py-3 text-sm text-gray-500 font-medium">
                                                <div className="flex items-center space-x-2">
                                                  <div className="flex flex-shrink-0 -space-x-1">
                                                    {application.assesors.map((assesor: any, index: number) => (
                                                      <div key={index}>
                                                        <UserIcon
                                                          className="max-w-none h-6 w-6 rounded-full bg-green-500 text-white border-2"
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                  {application.totalAssesors >
                                                  application.assesors.length ? (
                                                    <span className="flex-shrink-0 text-xs leading-5 font-medium">
                                                      +
                                                      {application.totalAssesors -
                                                        application.assesors.length}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              </td>
                                              <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {application.lastUpdated}
                                              </td>
                                              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                  onClick={() => {setView(true); setFormId(application.form_id); setUserId(application.user_id); fetchSkills(application.form_id)}}
                                                  className="text-green-500 hover:text-green-900"
                                                >
                                                  View
                                                </button>
                                              </td>
                                            </tr>
                                          ) : null
                                        }
                                      </>
                                    )))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </main>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </main>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
