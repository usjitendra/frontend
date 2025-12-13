export const runtime = 'edge';

import CampaignSetup from "@/components/campaign/CampaignSetup";

const CampaignDetails = async ({params}: {params: Promise<{ id: any }>}) => {
    const { id } = await params;

    return (
        <div>
            <CampaignSetup id={id} />
        </div>
    )
}

export default CampaignDetails;