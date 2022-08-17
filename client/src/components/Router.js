import { Route, Routes } from 'react-router-dom';
import Group from './Group';

function Router() {
    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
        </Routes>
    )
}

export default Router;