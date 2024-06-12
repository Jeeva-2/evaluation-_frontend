import React, { useEffect, useState } from 'react';
import styles from './Export.module.css';
import { BarLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Export = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    role: '',
    companyname: '',
    image: null as string | null // Image is stored as a base64 string or URL
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    redirectToHomePage(); // Redirect if no data found
  }, []);

  const redirectToHomePage = () => {
    const storedData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!storedData || Object.keys(storedData).length === 0) {
      window.location.href = '/'; // Redirect to home page if no data found
    } else {
      setFormData({
        email: storedData.email || '',
        name: storedData.name || '',
        age: storedData.age || '',
        role: storedData.role || '',
        companyname: storedData.companyname || '',
        image: storedData.image || null
      });
    }
  };
  const handleSendMail = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    try {
      const { name } = userData;
      const response = await fetch('http://localhost:3100/export_pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Data exported successfully!');
      } else {
        const errorData = await response.json();
        toast.error('Error exporting data: ' + (errorData.message || errorData.error));
      }
    } catch (error) {
      toast.error('Unexpected error occurred while exporting data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <BarLoader color="#36d7b7" />
        </div>
      )}
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h1 className={styles.heading}>Your Details</h1>
          <form className={`${styles.form} ${loading ? styles.loading : ''}`}>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Company Name</label>
                <input
                  type="text"
                  name="companyname"
                  value={formData.companyname}
                  readOnly
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.button} onClick={handleSendMail}>
                Send Mail
              </button>
              <button type="button" className={styles.button} onClick={handleExportData}>
                Export Data
              </button>
            </div>
          </form>
        </div>
        <div className={styles.imageContainer}>
          {formData.image && (
            <img src={formData.image} alt="Uploaded" className={styles.image} />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Export;