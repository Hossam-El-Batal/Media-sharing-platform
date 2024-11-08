    interface Post {
        post_id:String,
        user_id:String,
        content:String,
        type:'photo' | 'video',
        url:String,
        created_at: Date;
        updated_at: Date;
    }
    export default Post;