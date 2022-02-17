import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Router from "next/router";

import { Fragment, useState, useEffect } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CollectionIcon,
  SearchIcon,
  SortAscendingIcon,
  StarIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/solid'
import { MenuAlt1Icon, XIcon } from '@heroicons/react/outline'

import { supabase } from "../utils/supabaseClient";

import { Radar } from 'react-chartjs-2';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Admin: NextPage = () => {
  const [id, setId] = useState<any>(null);
  const [chart, setChart] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);
  const [activityItems, setActivityItems] = useState<any>(null);

  const generateCharts = async () => {
    let skills: any;
    let feedbacks: any;
    const chartData = [] as any[];
    try{
      const { data, error } = await supabase.from("skills").select().order('id', { ascending: false })
      if(error){
        throw error;
      }
      skills = data;
    }
    catch(error: any){
      alert(error.message)
    }
    try{
      const { data, error } = await supabase.from("feedbacks").select().order('id', { ascending: false })
      if(error){
        throw error;
      }
      feedbacks = data;
    }
    catch(error: any){
      alert(error.message)
    }
    try{
      const { data, error } = await supabase.from("applications").select().order('active', { ascending: false })
      if(error){
        throw error;
      }
      if(data){
        data.forEach((application, index) => {
          let labels = [] as any[];
          let datasets = [] as any[];
          let assesors = [] as any[];
          application.assesors.forEach((assesor: any) => {
            assesors.push(assesor);
          })
          skills.forEach((skill: any) => {
            if(skill.form_id === application.form_id){
              const categories = JSON.parse(skill.categories);
              categories.forEach((category: any) => {
                labels.push(category.name);
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
            feedbacks.forEach((feedback: any) => {
              if(feedback.form_id === application.form_id && feedback.user_id === assesor){
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
          chartData.push({
            labels: labels,
            datasets: datasets,
            formId: application.form_id,
            userId: application.user_id,
            active: application.active,
          });
        })
        setChart(chartData);
      }
    }
    catch(error: any){
      alert(error.message)
    }
  }

  const fetchActivities = async () => {
    try{
      const { data, error } = await supabase.from("activities").select().order('id', { ascending: false })
      if(error){
        throw error;
      }
      setActivityItems(data);
    }
    catch(error: any){
      alert(error.message);
    }
  }

  const updateForm = async (formId: string, active: boolean) => {
    try{
      const { data, error } = await supabase.from('applications').update({
        active: !active,
      }).match({ form_id: formId })
      if(error){
        throw error;
      }
    }
    catch(error: any){
      alert(error.message);
    }
    generateCharts();
    fetchActivities();
  }

  const deleteForm = async (formId: string) => {
    try{
      const { data, error } = await supabase.from('skills').delete().match({ form_id: formId })
      if(error){
        throw error;
      }
    }
    catch(error: any){
      alert(error.message);
    }
    try{
      const { data, error } = await supabase.from('feedbacks').delete().match({ form_id: formId })
      if(error){
        throw error;
      }
    }
    catch(error: any){
      alert(error.message);
    }
    try{
      const { data, error } = await supabase.from('applications').delete().match({ form_id: formId })
      if(error){
        throw error;
      }
    }
    catch(error: any){
      alert(error.message);
    }
    try{
      const { data, error } = await supabase.from('activities').delete().match({ application: formId })
      if(error){
        throw error;
      }
    }
    catch(error: any){
      alert(error.message);
    }
    generateCharts();
    fetchActivities();
  }

  useEffect(() => {
    if(localStorage.getItem("id") === "5O#@XH!8$t"){
      generateCharts();
      setVerified(true);
      fetchActivities();
      setId(localStorage.getItem("id"));
    }
    else{
      Router.push("/");
    }
  }, [])
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
      {
        verified ? (
          <div className="relative min-h-full flex flex-col py-10" id="top">
            {/* 3 column wrapper */}
            <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
              {/* Left sidebar & main wrapper */}
              <div className="flex-1 min-w-0 bg-white xl:flex">
                {/* Account profile */}
                <div className="xl:flex-shrink-0 xl:w-64 bg-white">
                  <div className="pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-8">
                        <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between sm:items-center xl:block xl:space-y-8">
                          {/* Profile */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-12 w-12">
                              <UserIcon
                                className="h-12 w-12 rounded-full text-green-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{id}</div>
                            </div>
                          </div>
                          {/* Action buttons */}
                          <div className="flex flex-col sm:flex-row xl:flex-col">
                            <Link href="/">
                              <a
                                className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                              >
                                Go back
                              </a>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <div className="bg-white lg:min-w-0 lg:flex-1">
                  <div className="pl-4 pr-6 pt-4 pb-4 border-b border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6">
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
                  </div>
                  <ul role="list">
                    {chart && (chart.map((item: any, index: number) => (
                      <div key={index}>
                        {
                          item.formId.includes(search) ? (
                            <li
                              key={index}
                              className="flex flex-col text-center bg-white pt-6"
                            >
                              <figure className="w-72 h-72 mx-auto py-4">
                                <Radar 
                                  data={{
                                    labels: item.labels,
                                    datasets: item.datasets,
                                  }}
                                  options={{ 
                                    maintainAspectRatio: false,
                                  }}
                                />
                              </figure>
                              <div className="flex-1 flex flex-col">
                                <h3 className="mt-6 text-gray-900 text-sm font-medium">{item.userId}</h3>
                                <dl className="mt-1 flex-grow flex flex-col justify-between">
                                  <dt className="sr-only">User</dt>
                                  <dd className="text-gray-500 text-sm">{item.formId}</dd>
                                  <dt className="sr-only">Form</dt>
                                </dl>
                              </div>
                              <div className="border-t border-b border-gray-200 mt-10">
                                <div className="-mt-px flex divide-x divide-gray-200">
                                  <div className="w-0 flex-1 flex">
                                    <button
                                      type="button"
                                      className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                                      onClick={() => updateForm(item.formId, item.active)}
                                    >
                                      <span className="ml-3">{item.active ? ("Archive") : ("Activate")}</span>
                                    </button>
                                  </div>
                                  <div className="-ml-px w-0 flex-1 flex">
                                    <button
                                      type="button"
                                      className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                                      onClick={() => deleteForm(item.formId)}
                                    >
                                      <span className="ml-3">Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ) : null
                        }
                      </div>
                    )))}
                  </ul>
                </div>
              </div>
              {/* Activity feed */}
              <div className="pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 xl:pr-0">
                <div className="pl-6 lg:w-80">
                  <div className="pt-6 pb-2">
                    <h2 className="text-sm font-semibold">Activity</h2>
                  </div>
                  <div>
                    <ul role="list" className="divide-y divide-gray-200">
                      {activityItems && (activityItems.map((item: any, index: number) => (
                        <li key={index} className="py-4">
                          <div className="flex space-x-3">
                            <UserIcon
                              className="h-6 w-6 rounded-full text-green-500"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">{id === item.user ? ("You") : item.user}</h3>
                                <p className="text-sm text-gray-500">{item.date}</p>
                              </div>
                              <p className="text-sm text-gray-500">
                                {item.activity} <br/>
                                <a href="#top" onClick={() => setSearch(item.application)} className="font-sora text-green-500 text-xs cursor-pointer">({item.application})</a>
                              </p>
                            </div>
                          </div>
                        </li>
                      )))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
    </div>
  );
};

export default Admin;
