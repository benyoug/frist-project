<?php

namespace App\Models;

use Dcs\Admin\Models\SysUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskMember extends Model
{
    protected $fillable = [
        'tsk_workspace_id',
        'sys_user_id',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    use SoftDeletes;

    public function sys_user(): BelongsTo
    {
        return $this->belongsTo(SysUser::class, 'sys_user_id');
    }
     public function tsk_workspace(): BelongsTo
     {
        return $this->belongsTo(TskWorkspace::class, 'tsk_workspace_id');
     }

    public function tsk_list()
    {
        return $this->belongsToMany(TskList::class, 'tsk_lists_tsk_members', 'tsk_member_id', 'tsk_list_id');
     }

    public function tsk_projects()
    {
        return $this->belongsToMany(TskProject::class, 'tsk_projects_tsk_members', 'tsk_member_id', 'tsk_project_id');
     }

//    public function tsk_colleagues()
//    {
//        $this->tsk_list()
//     }

}
