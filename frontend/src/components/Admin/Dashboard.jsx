import { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

const Dashboard = ({ activeTab, children }) => {

    const [onMobile, setOnMobile] = useState(false);
    const [toggleSidebar, setToggleSidebar] = useState(false);

    useEffect(() => {
        if (window.innerWidth < 600) {
            setOnMobile(true);
        }
    }, [])

    return (
        <>
            <main className="mt-14 flex min-h-screen bg-app-page sm:min-w-full">

                {!onMobile && <Sidebar activeTab={activeTab} />}
                {toggleSidebar && <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar}/>}

                <div className="w-full sm:w-4/5 sm:ml-72 min-h-screen">
                    <div className="flex flex-col gap-6 sm:m-8 p-2 pb-6 overflow-hidden">
                        <button type="button" onClick={() => setToggleSidebar(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-card text-slate-100 shadow-md shadow-black/30 sm:hidden"><MenuIcon /></button>
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;
