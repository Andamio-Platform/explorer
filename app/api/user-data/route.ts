import 'dotenv/config';

import AndamioSDK from '@andamiojs/sdk';
import { NextRequest, NextResponse } from 'next/server';


const sdk = new AndamioSDK(
    "https://mainnet.utxorpc-v0.demeter.run:443",
    "Mainnet",
    process.env.DMTR_API_KEY
);

export async function GET(request: NextRequest) {
    try {
        // Parse query params if needed
        const searchParams = request.nextUrl.searchParams;
        const alias = searchParams.get('alias');

        console.log('Fetching user data...');
        // Your data fetching logic here
        if (!alias) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Alias parameter is required'
                },
                { status: 400 }
            );
        }

        const userData = await sdk.provider.network.getUserData(alias);

        console.log('User data:', userData);

        // Return the response
        return NextResponse.json(
            {
                success: true,
                data: userData // Your data here
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user data'
            },
            { status: 500 }
        );
    }
}