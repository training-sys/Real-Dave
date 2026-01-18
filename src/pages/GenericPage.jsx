import { Typography } from 'antd';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

const { Title } = Typography;

const GenericPage = ({ title, description }) => {
    return (
        <div
            style={{
                maxWidth: 800,
                margin: '0 auto',
                padding: 24,
                background: '#f9fafb',
                borderRadius: 8,
                border: '1px solid #e5e7eb'
            }}
        >
            <Title level={3} style={{ marginBottom: 16, color: '#0f172a' }}>{title}</Title>
            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
                <ReactMarkdown>{description || `This is the ${title} page. Feature implementation coming soon.`}</ReactMarkdown>
            </div>
        </div>
    );
};

GenericPage.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
};

export default GenericPage;
