import PropTypes from 'prop-types';
import GenericMasterList from '../components/GenericMasterList';
import { useData } from '../context/DataContext';

const MasterListWrapper = ({ title, type }) => {
    const dataContext = useData();

    let data, setData;
    switch (type) {
        case 'areas':
            data = dataContext.areas;
            setData = dataContext.setAreas;
            break;
        case 'subTypes':
            data = dataContext.subTypes;
            setData = dataContext.setSubTypes;
            break;
        case 'societies':
            data = dataContext.societies;
            setData = dataContext.setSocieties;
            break;
        case 'features':
            data = dataContext.features;
            setData = dataContext.setFeatures;
            break;
        case 'amenities':
            data = dataContext.amenities;
            setData = dataContext.setAmenities;
            break;
        case 'sources':
            data = dataContext.sources;
            setData = dataContext.setSources;
            break;
        case 'contactGroups':
            data = dataContext.contactGroups;
            setData = dataContext.setContactGroups;
            break;
        case 'commissions':
            data = dataContext.commissions;
            setData = dataContext.setCommissions;
            break;
        default:
            data = [];
            setData = () => { };
    }

    const isSuperAdmin = dataContext.userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : dataContext.userProfile.role || 'Admin';
    const rolePermissions = dataContext.permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Settings || {};
    const canView = isSuperAdmin || !!modulePermissions.view;
    const canCreate = isSuperAdmin || !!modulePermissions.create;
    const canEdit = isSuperAdmin || !!modulePermissions.edit;
    const canDelete = isSuperAdmin || !!modulePermissions.delete;

    const handleAdd = (newItem) => {
        if (!canCreate) {
            return;
        }
        setData([...data, newItem]);
    };

    const handleEdit = (updatedItem) => {
        if (!canEdit) {
            return;
        }
        setData(data.map(item => item.key === updatedItem.key ? updatedItem : item));
    };

    const handleDelete = (key) => {
        if (!canDelete) {
            return;
        }
        setData(data.filter(item => item.key !== key));
    };

    return (
        <GenericMasterList
            title={title}
            data={data}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canView={canView}
            canCreate={canCreate}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
};

MasterListWrapper.propTypes = {
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
};

export default MasterListWrapper;
