import React, { useState, useEffect } from "react";
import Select from "react-tailwindcss-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tailwindcss-select/dist/index.css'
import { NumericFormat } from 'react-number-format';


function IpModal({
  isModalOpen,
  toggleModal,
  bipActor,
  userPrincipal,
  fetchEntries,
}) {

  const formatDate = (date) => {
    return date.toISOString().slice(0, 10);  // Convert date object to string and take the first 10 characters
  };

  const initialFormState = () => ({
    title: "",
    price: 0,
    ipLicense: null,
    ipLicenseValue: [],
    category: null,
    description: "",
    authorName: "",
    familyName: "",
    authorSpeciality: "",
    authorAddress: "",
    publishingDate: "",
    creationDate: formatDate(new Date()),
    image: null,
  });
  

  const [formData, setFormData] = useState(initialFormState);


  const [isNotApplicable, setIsNotApplicable] = useState(false);
  const [formType, setFormType] = useState("ip_details");

 // Handles input changes for all form fields
 const handleChange = (e) => {
  const { name, value, files } = e.target;
  console.log(value);
  if (name === "ipLicense") {
    const hasNotApplicable = value.some(
      (option) => option.value === "Not Applicable"
    );
    if (hasNotApplicable && isNotApplicable === false) {
      setFormData((prevState) => ({
        ...prevState,
        ipLicense: [
          {
            value: "Not Applicable",
            label: "Not Applicable",
            disabled: false,
          },
        ],
      }));
      setFormData((prevState) => ({
        ...prevState,
        ipLicenseValue: ["Not Applicable"],
      }));

      setIsNotApplicable(true);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value.filter((v) => v.value !== "Not Applicable"),
      }));

      setIsNotApplicable(false);
      setFormData((prevState) => ({
        ...prevState,
        ipLicenseValue: value.map((v) => v.value).filter(v => v !== "Not Applicable"),
      }));
    }
  } else if (name === "image") {
    setFormData((prevState) => ({
      ...prevState,
      image: files[0],
    }));
  } else {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }
};

  // Handle form submission// Function to check for empty fields using toast for notification
  const isFormValid = () => {
    const requiredFields = ['title', 'price', 'description', 'authorName', 'familyName', 'authorSpeciality', 'authorAddress', 'publishingDate'];
    for (let field of requiredFields) {
  
      if (!formData[field] || formData[field].trim() === "") {

        toast.error(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return; // Stop submission if the form is invalid
    }
    if (!bipActor) {
      toast.error("The actor is not initialized. Please check your configuration.");
      return;
    }
  

    try {
      // const result = await bipActor.addEntry(
      //   formData.title,
      //   formData.price,
      //   formData.ipLicenseValue.join(", "),
      //   formData.category.value,
      //   formData.description,
      //   formData.authorName,
      //   formData.familyName,
      //   formData.authorSpeciality,
      //   formData.authorAddress,
      //   formData.publishingDate,
      //   formData.creationDate
      // );

      let imageData = null;
      if (formData.image) {
        const reader = new FileReader();
        reader.onloadend = async () => {


          imageData = new Uint8Array(reader.result);
          
          const result = await bipActor.addEntry(
            formData.title,
            formData.price,
            formData.ipLicenseValue.join(", "),
            formData.category.value,
            formData.description,
            formData.authorName,
            formData.familyName,
            formData.authorSpeciality,
            formData.authorAddress,
            formData.publishingDate,
            formData.creationDate,
            imageData
          );

          console.log("Entry added successfully:", result);
          setFormData(initialFormState());
          toggleModal();
          fetchEntries();
          toast.success("IP entry added successfully!");
        };
        reader.readAsArrayBuffer(formData.image);
      }
      else{
        alert("Add an image to continue;")
      }


    } catch (error) {
      console.error("Failed to add entry:", error);
      toast.error("Failed to add IP entry: " + error.message);
    }
  };

  return (
    <>
      <div
        id="crud-modal"
        tabIndex="-1"
        aria-hidden={!isModalOpen}
        className={`${isModalOpen ? "flex" : "hidden"} fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New IP
              </h3>
              <button
                type="button"
                onClick={toggleModal}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-5">
              {formType === "ip_details" && (
                <div className="grid gap-4 mb-4 grid-cols-2">
                  
                  {[
                    {
                      name: "title",
                      label: "Title",
                      type: "text",
                      placeholder: "Enter Title here",
                    },
                    {
                      name: "price",
                      label: "Price (USD)",
                      type: "number",
                      placeholder: "$2999",
                    },
                    {
                      name: "ipLicense",
                      label: "IP License",
                      type: "select",
                      options: [
                        { value: "SAAS", label: "SAAS" },
                        { value: "Virtual Reproduction", label: "Virtual Reproduction" },
                        { value: "Gaame FI", label: "Gaame FI" },
                        { value: "Meta use", label: "Meta use" },
                        { value: "Physical Reproduction", label: "Physical Reproduction" },
                        { value: "Advertisement", label: "Advertisement" },
                        { value: "Not Applicable", label: "Not Applicable" },
                      ],
                      isMultiple: true,
                    },
                    {
                      name: "category",
                      label: "IP TYPE",
                      type: "select",
                      options: [
                        { value: "Copyright", label: "Copyright" },
                        { value: "Pre-Patent", label: "Pre-Patent" },
                        { value: "Trademark", label: "Trademark" },
                        { value: "Trade secret", label: "Trade secret" },
                        {
                          value: "Industrial design rights",
                          label: "Industrial design rights",
                        },
                        {
                          value: "Geographical indications",
                          label: "Geographical indications",
                        },
                        {
                          value: "Plant variety rights",
                          label: "Plant variety rights",
                        },
                      ],
                      isMultiple: false,
                    },
                    {
                      name: "publishingDate",
                      label: "Publishing Date",
                      type: "date",
                      placeholder: "",
                    },
                    {
                      name: "description",
                      label: "Product Description",
                      type: "text",
                      placeholder: "Write product description here",
                    },
                    {
                      name: "image",
                      label: "Upload Image",
                      type: "file",
                      placeholder: "",
                    },
                   
                  ].map((field) =>
                    field.type === "textarea" ? (
                      <div key={field.name} className="col-span-2">
                        <label
                          htmlFor={field.name}
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {field.label}
                        </label>
                        <textarea
                          id={field.name}
                          name={field.name}
                          rows="4"
                          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    ) : (
                      <div
                        key={field.name}
                        className={`col-span-2 ${
                          field.type === "select" ? "sm:col-span-2" : ""
                        }`}
                      >
                        <label
                          htmlFor={field.name}
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <Select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(selectedOptions) =>
                              handleChange({
                                target: {
                                  name: field.name,
                                  value: selectedOptions,
                                },
                              })
                            }
                            isMultiple={field.isMultiple}
                            options={field.options}
                            placeholder={
                              field.isMultiple
                                ? "Select options"
                                : "Select an option"
                            }
                            noOptionsMessage={() => "No options found"}
                          />
                        ) :  field.name == "price" ? (
                          <NumericFormat
                            value={formData[field.name]}
                            onValueChange={(values) => {
                              handleChange({
                                target: {
                                  name: field.name,
                                  value: values.value,
                                },
                              })
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            thousandSeparator=","
                            decimalScale={2}
                          />
                        ) : field.type === "file" ? (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder={field.placeholder}
                            onChange={handleChange}
                          />
                        ) : (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required=""
                          />
                        )}
                      </div>
                    )
                  )}
          

                  <button
                    onClick={() => setFormType("author")}
                    className="col-span-2 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Add Author Details
                  </button>
                </div>
              )}
              {formType === "author" && (
                <>
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    {[
                      {
                        name: "authorName",
                        label: "Author Name",
                        type: "text",
                        placeholder: "Enter Author Name ",
                      },
                      {
                        name: "familyName",
                        label: "Author Family Name",
                        type: "text",
                        placeholder: "Author Family Name",
                      },
                      {
                        name: "authorSpeciality",
                        label: "Author Speciality",
                        type: "text",
                        placeholder: "Author Speciality",
                      },
                      {
                        name: "authorAddress",
                        label: "Author Address",
                        type: "textarea",
                        placeholder: "Write Author Address here",
                      },
                    ].map((field) =>
                      field.type === "textarea" ? (
                        <div key={field.name} className="col-span-2">
                          <label
                            htmlFor={field.name}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {field.label}
                          </label>
                          <textarea
                            id={field.name}
                            name={field.name}
                            rows="4"
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={handleChange}
                          ></textarea>
                        </div>
                      ) : (
                        <div
                          key={field.name}
                          className={`col-span-2 ${
                            field.type === "select" ? "sm:col-span-2" : ""
                          }`}
                        >
                          <label
                            htmlFor={field.name}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required=""
                          />
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex justify-between items-stretch">
                    <button
                      onClick={() => setFormType("ip_details")}
                      className="w-20 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-30 text-white inline-flex bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Submit IP
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default IpModal;
