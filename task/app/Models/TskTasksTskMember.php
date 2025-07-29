<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskTasksTskMember extends Model
{
    use SoftDeletes;


    protected $table = 'tsk_tasks_tsk_members';

    protected $fillable = [
        'tsk_task_id',
        'tsk_member_id',
        ];

    function tsk_tasks(){
        return $this->belongsTo(TskTask::class,'tsk_tasks_id');
    }
     function tsk_members()
     {
         return $this->belongsTo(TskMember::class, 'tsk_members_id');
     }

     public function tsk_member()
{
    return $this->belongsTo(TskMember::class, 'tsk_member_id');
}

}
