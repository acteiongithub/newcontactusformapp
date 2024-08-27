import React, { useState } from 'react';
import ContactForm from './ContactForm';
import ContactList from './ContactList';

const App = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleFormSubmit = () => {
        setFormSubmitted(true);
    };

    return (
        <div>
            <ContactForm onFormSubmit={handleFormSubmit} />
            <ContactList formSubmitted={formSubmitted} />
        </div>
    );
};

export default App;
