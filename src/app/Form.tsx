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
      toast.error(error.image);
      setLoading(false);
      return;
    }

    // Convert image file to base64 string
    let base64Image = '';
    if (formData.image) {
      const compressedImage = await imageCompression(formData.image, {
        maxSizeMB: 1, // Adjust the maximum size in MB as needed
        maxWidthOrHeight: 1920, // Adjust the maximum width or height as needed
        useWebWorker: true
      });
      base64Image = await convertToBase64(compressedImage);
    }

    const data = {
      email: formData.email.trim().toLowerCase(),
      name: formData.name.trim(),
      age: formData.age.trim(),
      roll: formData.roll.trim(),
      companyname: formData.company.trim(),
      image: base64Image
    };

    // Log the data object for debugging
    console.log("Data to be sent:", JSON.stringify(data));
    try {
      const response = await fetch('http://localhost:3100/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if the response is ok (status in the range 200-299)
      if (response.ok) {
        console.log('Form submitted successfully');
        const responseData = await response.json();
        localStorage.setItem('userData', JSON.stringify(responseData));
        setIsSubmitted(true);
        toast.success('Form submitted successfully!');
      } else {
        // Handle the error response
        const errorData = await response.json();
        console.error('Error:', errorData.message || errorData.error);
        if (response.status === 400) {
          toast.error(errorData.message || "User already exists");
        } else {
          toast.error('Error submitting form: ' + errorData.message || errorData.error);
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

  // Helper function to convert a file to a base64 encoded string
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMail = async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    try {
      const response = await fetch('http://localhost:3100/send_mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success('Mail sent successfully!');
      } else {
        const errorData = await response.json();
        toast.error('Error sending mail: ' + (errorData.message || errorData.error));
      }
    } catch (error) {
      toast.error('Unexpected error occurred while sending mail. Please try again later.');
    }
  };

  const handleExportData = async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    try {
      const response = await fetch('/api/exportData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      });

      if (response.ok) {
        const { filePath } = await response.json();
        const link = document.createElement('a');
        link.href = filePath;
        link.download = 'userData.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported successfully!');
      } else {
        const errorData = await response.json();
        toast.error('Error exporting data: ' + (errorData.message || errorData.error));
      }
    } catch (error) {
      toast.error('Unexpected error occurred while exporting data. Please try again later.');
    }
  };

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
          <label className={styles.label}>Email</label>
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
          <label className={styles.label}>Name</label>
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
          <label className={styles.label}>Age</label>
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
          <label className={styles.label}>Roll</label>
          <input
            type="text"
            name="roll"
            value={formData.roll}
            onChange={handleChange}
            required
            className={styles.input}
            readOnly={isSubmitted} // Make input read-only after submission
          />
          {errors.roll && <div className={styles.error}>{errors.roll}</div>}
        </div>
        <div>
          <label className={styles.label}>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className={styles.input}
            readOnly={isSubmitted} // Make input read-only after submission
          />
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
          {isSubmitted && (
            <>
              <button type="button" className={styles.button} onClick={handleSendMail}>
                Send Mail
              </button>
              <button type="button" className={styles.button} onClick={handleExportData}>
                Export Data
              </button>
            </>
          )}
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Form;
