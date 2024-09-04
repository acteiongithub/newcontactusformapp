import React, { useState } from 'react';
import ContactForm from './ContactForm';
import ContactList from './ContactList';

const App = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleFormSubmit = () => {
        // Toggle formSubmitted to refresh ContactList data
        setFormSubmitted(prevState => !prevState);
    };

    return (
        <div>
            <ContactForm onFormSubmit={handleFormSubmit} />
            <ContactList formSubmitted={formSubmitted} />
        </div>
    );
};

export default App;
