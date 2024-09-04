import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactList = ({ formSubmitted }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get('/api/getcontacts');
                setContacts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchContacts();
    }, [formSubmitted]); // Add formSubmitted to the dependency array
    

    return (
        <div>
            <h1>Existing Customers</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                {Array.isArray(contacts) && contacts.map(item => (
                    <tr key={item.customerid}>
                        <td>{item.customerid}</td>
                        <td>{item.firstname}</td>
                        <td>{item.lastname}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{item.message}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
    );
};

export default ContactList;
