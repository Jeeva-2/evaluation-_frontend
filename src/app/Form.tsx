import { useState } from 'react';
import styles from './Form.module.css';
import imageCompression from 'browser-image-compression';
import { BarLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB

const Form = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    roll: '',
    company: '',
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    age: '',
    roll: '',
    company: '',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target;
    let error = '';

    if (name === 'image' && files) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        error = 'Only image files are allowed';
      } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        error = `File size should not exceed ${MAX_FILE_SIZE_MB} MB`;
      }
    }

    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });

    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start the loader

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error)) {
      toast.error('Please fix the errors in the form');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('email', formData.email.trim().toLowerCase());
    formDataToSend.append('name', formData.name.trim());
    formDataToSend.append('age', formData.age.trim());
    formDataToSend.append('roll', formData.roll.trim());
    formDataToSend.append('companyname', formData.company.trim());

    if (formData.image) {
      const compressedImage = await imageCompression(formData.image, {
        maxSizeMB: 1, // Adjust the maximum size in MB as needed
        maxWidthOrHeight: 1920, // Adjust the maximum width or height as needed
        useWebWorker: true
      });
      formDataToSend.append('file', compressedImage);
    }

    try {
      const response = await fetch('http://localhost:3100/add_user', {
        method: 'POST',
        body: formDataToSend,
      });

      // Check if the response is ok (status in the range 200-299)
      if (response.ok) {
        console.log('Form submitted successfully');
        const responseData = await response.json();
        localStorage.setItem('userData', JSON.stringify(responseData));
        setIsSubmitted(true);
        toast.success('Form submitted successfully!');
        window.location.href = '/export'; // Redirect to home page if no data found
      } else {
        // Handle the error response
        const errorData = await response.json();
        console.error('Error:', errorData.message || errorData.error);
        if (response.status === 400) {
          toast.error(errorData.message || "User already exists");
        } else {
          toast.error('Error submitting form: ' + errorData.message);
        }
      }
    } catch (error) {
      // Handle any other errors that occur during the fetch
      console.error('Unexpected error:', error);
      toast.error('Unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); // Stop the loader
    }
  }

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <BarLoader color="#36d7b7" />
        </div>
      )}
      <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ''}`}>
        <h2 className={styles.heading}>Submit Your Details</h2>
        <div>
          <label className={styles.label}><label className={styles.error}> * </label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            readOnly={isSubmitted} // Make input read-only after submission
          />
          {errors.email && <div className={styles.error}>{errors.email}</div>}
        </div>
        <div>
          <label className={styles.label}><label className={styles.error}> * </label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
            readOnly={isSubmitted} // Make input read-only after submission
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>
        <div>
          <label className={styles.label}><label className={styles.error}> * </label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            required
            className={styles.input}
            readOnly={isSubmitted} // Make input read-only after submission
          />
          {errors.age && <div className={styles.error}>{errors.age}</div>}
        </div>
        <div>
          <label className={styles.label}><label className={styles.error}> * </label>Role</label>
          <div className={styles.inputGroup}>
            <select
              name="roll"
              value={formData.roll}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={isSubmitted}
            >
              <option value="">Select a roll</option>
              <option value="intern">Intern</option>
              <option value="developer">Developer</option>
              <option value="manager">Manager</option>
              <option value="designer">Designer</option>
              {/* <option value="other">Other</option> */}
            </select>
            {formData.roll === 'other' && (
              <input
                type="text"
                name="rollOther"
                value={formData.roll}
                onChange={handleChange}
                required
                placeholder="Enter roll"
                className={styles.input}
                readOnly={isSubmitted}
              />
            )}
          </div>
          {errors.roll && <div className={styles.error}>{errors.roll}</div>}
        </div>
        <div>
          <label className={styles.label}><label className={styles.error}> * </label>Company</label>
          <select
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className={styles.input}
            disabled={isSubmitted} // Make dropdown disabled after submission
          >
            <option value="">Select a company</option>
            <option value="Aaludra Technology Solutions">Aaludra Technology Solutions</option>
            <option value="Google">Google</option>
            <option value="amazon">Amazon</option>
            {/* Add more options as needed */}
          </select>
          {errors.company && <div className={styles.error}>{errors.company}</div>}
        </div>
        <div>
          <label className={styles.label}>Upload Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className={styles.fileInput}
            disabled={isSubmitted} // Disable file input after submission
          />
          {errors.image && <div className={styles.error}>{errors.image}</div>}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.button} disabled={loading}>
            Submit
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Form;
