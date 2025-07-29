<?php

namespace App\Http\Controllers;

use App\Models\TskTask;
use Illuminate\Http\Request;
use App\Models\TskMember;
use App\Models\TskProjectTskMembers;
class TaskController extends Controller
{
     public function gettaskOfMember(){
        $member_user = TskMember::where('sys_user_id',auth()->id)->first();
        $owner_id = TskProjectTskMembers::query()->where('is_owner', 1)->where('tsk_member_id',  );
        $controller_id = TskProjectTskMembers::query()->where('is_controller', 1)->where('tsk_member_id', ($member_user ? $member_user->id : null));
        
        $tasks = TskTask::whereHas('tsk_members', function ($q) use ($member_user) {
                 $q->where('tsk_member_id', $member_user ? $member_user->id : null);
        });



        return response()->json($tasks ,200);

     }

}
