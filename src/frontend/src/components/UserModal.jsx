import React, { useState } from 'react';

function UserModal({ isModalOpen, toggleModal, bipActor, userPrincipal }) {
    // Form state initialization
    const [formData, setFormData] = useState({
        name: '',
        familyName: '',
        nickName: '',
        specialty: '',
        country: ''
    });

    // Handles input changes for all form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the form from submitting through the browser
    
        // Ensure the actor is available
        if (!bipActor) {
            alert("The actor is not initialized. Please check your configuration.");
            return;
        }
    
        try {
            // Calling the addUserEntry method on the actor
            // const result = await bipActor.addUserEntry(
            //     formData.name,
            //     formData.familyName,
            //     formData.nickName,
            //     formData.specialty,
            //     formData.country
            // );
         
            console.log("User added/updated successfully:", result);
    
            // Reset the form state and close the modal on successful submission
            setFormData({
                name: '',
                familyName: '',
                nickName: '',
                specialty: '',
                country: ''
            });
            toggleModal(); // Optionally close the modal
            alert("User information added/updated successfully!");
        } catch (error) {
            console.error("Failed to add/update user:", error);
            alert("Failed to add/update user information: " + error.message);
        }
    };

    return (
        <>
            <div
                id="crud-modal"
                tabIndex="-1"
                aria-hidden={!isModalOpen}
                className={`${isModalOpen ? 'flex' : 'hidden'} fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
            >
                <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ userPrincipal} </h3>
                            <button
                                type="button"
                                onClick={toggleModal}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 md:p-5">
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                { /* Form fields with update handlers */ }
                                {[
                                    { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter Name' },
                                    { name: 'familyName', label: 'Family Name', type: 'text', placeholder: 'Enter Family Name' },
                                    { name: 'nickName', label: 'Nickname', type: 'text', placeholder: 'Enter Nickname' },
                                    { name: 'specialty', label: 'Specialty', type: 'text', placeholder: 'Enter Specialty' },
                                    { name: 'country', label: 'Country', type: 'text', placeholder: 'Enter Country' }
                                ].map(field => (
                                    <div key={field.name} className="col-span-2">
                                        <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{field.label}</label>
                                        <input
                                            type={field.type}
                                            id={field.name}
                                            name={field.name}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder={field.placeholder}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            required=""
                                        />
                                    </div>
                                ))}
                                <button type="submit" className="col-span-2 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                                    Add/Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserModal;
