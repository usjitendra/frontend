export const runtime = 'edge';

import ProviderForm from "../ProviderForm";

const ProviderEditPage = async ({params}: {params: Promise<{ edit: any }>}) => {    
    const { edit } = await params;
    console.log("edit",edit);
    return (
        <div className="bg-gray-100 h-screen">
            <ProviderForm id={edit} />
        </div>
    )
}

export default ProviderEditPage;