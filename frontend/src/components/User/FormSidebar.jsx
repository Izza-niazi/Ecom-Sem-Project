
const FormSidebar = ({ title, tag }) => {
    return (
        <div className="loginSidebar hidden w-2/5 flex-col gap-4 px-9 py-10 sm:flex">
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="pr-2 text-lg text-slate-400">{tag}</p>
        </div>
    )
}

export default FormSidebar
