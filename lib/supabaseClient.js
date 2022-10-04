import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getRestaurants = async () => {
    let { data, error, status } = await supabase
        .from('restaurants')
        .select()

    if (error && status !== 406) {
        throw error
    }

    if (data) {
        return data;
    }

}

export const getRestaurant = async (uuid) => {
    let { data, error, status } = await supabase
        .from('restaurants')
        .select()
        .eq('uuid', uuid)
        .single()

    if (error && status !== 406) {
        throw error
    }

    if (data) {
        return data;
    }

}
