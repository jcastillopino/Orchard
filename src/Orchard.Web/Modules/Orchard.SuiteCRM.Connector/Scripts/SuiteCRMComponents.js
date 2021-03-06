/// Orchard Collaboration is a series of plugins for Orchard CMS that provides an integrated ticketing system and collaboration framework on top of it.
/// Copyright (C) 2014-2016  Siyamand Ayubi
///
/// This file is part of Orchard Collaboration.
///
///    Orchard Collaboration is free software: you can redistribute it and/or modify
///    it under the terms of the GNU General Public License as published by
///    the Free Software Foundation, either version 3 of the License, or
///    (at your option) any later version.
///
///    Orchard Collaboration is distributed in the hope that it will be useful,
///    but WITHOUT ANY WARRANTY; without even the implied warranty of
///    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
///    GNU General Public License for more details.
///
///    You should have received a copy of the GNU General Public License
///    along with Orchard Collaboration.  If not, see <http://www.gnu.org/licenses/>.

var orchardcollaboration = orchardcollaboration || {};
orchardcollaboration.react = orchardcollaboration.react || {};
orchardcollaboration.react.allComponents = orchardcollaboration.react.allComponents || {};

(function () {
	function formatDate(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
	};

	var x = orchardcollaboration.react.allComponents;

	var Parts_SyncProjectTitle_Summary = React.createClass({
		displayName: 'Parts_SyncProjectTitle_Summary',

		render: function () {
			var projectDisplayRoute = this.props.root.Routes.ProjectUrl;
			var url = decodeURI(projectDisplayRoute);
			url = url.replace("{id}", this.props.Model.Record.Id);

			return React.createElement(
				'h4',
				null,
				React.createElement(
					'a',
					{ href: url, target: '_blank' },
					this.props.Model.Record.Title
				)
			);
		}
	});
	x.Parts_SyncProjectTitle_Summary = Parts_SyncProjectTitle_Summary;

	var Parts_Common_Metadata__SyncProject = React.createClass({
		displayName: 'Parts_Common_Metadata__SyncProject',

		render: function () {
			var date = new Date(this.props.ContentPart.ModifiedUtc);
			var dateString = formatDate(date);
			return React.createElement(
				'div',
				{ className: 'modified-date' },
				React.createElement(
					'span',
					{ className: 'date-label' },
					this.props.root.T("LastModifiedTime", "Last Modified Time"),
					':'
				),
				React.createElement(
					'span',
					{ className: 'date' },
					dateString
				)
			);
		}
	});
	x.Parts_Common_Metadata__SyncProject = Parts_Common_Metadata__SyncProject;

	var Content_SyncProject_Detail = React.createClass({
		displayName: 'Content_SyncProject_Detail',

		render: function () {

			var content = null;
			var footer = null;
			if (this.props.shape.Content != null) {
				content = React.createElement(x.Display, { root: this.props.root, shape: this.props.shape.Content });
			}

			if (this.props.shape.Footer != null) {
				footer = React.createElement(x.Display, { root: this.props.root, shape: this.props.shape.Footer });
			}
			return React.createElement(
				'div',
				null,
				content,
				footer
			);
		}
	});
	x.Content_SyncProject_Detail = Content_SyncProject_Detail;

	var SuiteCRMSyncUsers = React.createClass({
		displayName: 'SuiteCRMSyncUsers',

		showSyncModal: function () {},

		getInitialState: function () {
			return {
				isSyncModalOpen: false,
				operation: null,
				modalStateError: null,
				modalStateClass: "hidden",
				selectedUser: null
			};
		},

		showSyncModal: function (user, operation) {

			// check is there any user to sync
			var isThereAnyUser = false;
			if (operation && operation == "copyAll") {
				for (var i = 0; i < this.props.model.Users.length; i++) {
					if (!this.props.model.Users[i].IsSync) {
						isThereAnyUser = true;
						break;
					}
				}

				if (!isThereAnyUser) {
					return;
				}
			}

			this.state.modalStateClass = "hidden";
			this.state.modalStateError = "";
			this.state.isSyncModalOpen = true;
			this.state.operation = operation;
			this.state.selectedUser = user;
			this.setState(this.state);
		},

		closeSyncModal: function () {
			this.state.isSyncModalOpen = false;
			this.setState(this.state);
		},

		runSyncing: function () {
			var root = this.props.root;

			if (!this.refs.password.value) {
				this.state.modalStateClass = "visible";
				this.state.modalStateError = root.T("ProvidePassword", "Please enter the password");
				this.setState(this.state);
				return;
			}

			if (this.refs.password.value != this.refs.confirmPassword.value) {
				this.state.modalStateClass = "visible";
				this.state.modalStateError = root.T("ProvidePassword", "Confirm password doesn't match the given password.");
				this.setState(this.state);
				return;
			}

			this.state.isSyncModalOpen = false;
			this.setState(this.state);

			if (this.state.operation == "copyAll") {
				this.props.root.actions.copyAllUsersToOrchard(this.refs.password.value);
			} else {
				this.props.root.actions.copyUserToOrchard(this.state.selectedUser, this.refs.password.value);
			}
		},

		render: function () {
			var _self = this;
			var root = _self.props.root;

			if (!_self.props.model.ViewUsersPage) {
				return React.createElement('script', null);
			}

			var users = this.props.model.Users.map(function (user) {
				var orchardUser = null;
				if (user.IsSync) {
					var userUrl = decodeURI(root.Routes.OperatorLink);
					userUrl = userUrl.replace("{userid}", user.OrchardUserId);
					orchardUser = React.createElement(
						'div',
						{ className: 'orchard-project-container full' },
						React.createElement(
							'div',
							null,
							React.createElement(
								'h4',
								null,
								React.createElement(
									'a',
									{ target: '_blank', href: userUrl },
									user.OrchardUsername
								)
							),
							React.createElement(
								'div',
								{ className: 'email' },
								React.createElement(
									'span',
									{ className: 'email-label' },
									root.T("Email", "Email"),
									':'
								),
								React.createElement(
									'a',
									{ target: '_blank', href: userUrl },
									user.OrchardEmail
								)
							)
						)
					);
				} else {
					orchardUser = React.createElement('div', { className: 'orchard-project-container empty' });
				}

				var syncLink = null;
				if (!user.IsSync) {
					syncLink = React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, user, "") });
				}

				return React.createElement(
					'div',
					{ className: 'sync-project-row data-row' },
					orchardUser,
					React.createElement(
						'div',
						{ className: 'suitecrm-project-container full' },
						React.createElement(
							'div',
							null,
							React.createElement(
								'h4',
								null,
								user.SuiteCRMUsername
							),
							React.createElement(
								'div',
								{ className: 'email' },
								React.createElement(
									'span',
									{ className: 'email-label' },
									root.T("Email", "Email"),
									':'
								),
								React.createElement(
									'span',
									null,
									user.SuiteCRMEmail
								)
							)
						),
						syncLink
					)
				);
			});

			if (users.length == 0) {
				users = React.createElement(
					'div',
					null,
					root.T("ThereIsNoUser", "There is no user to import")
				);
			}

			var syncAllLink = null;
			// check is there any user to sync
			var isThereAnyUser = false;
			for (var i = 0; i < this.props.model.Users.length; i++) {
				if (!this.props.model.Users[i].IsSync) {
					isThereAnyUser = true;
					break;
				}
			}

			if (isThereAnyUser) {
				syncAllLink = React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, null, "copyAll") });
			}

			return React.createElement(
				'article',
				{ className: 'panel panel-default modal-container' },
				React.createElement(
					'div',
					{ className: 'panel-heading' },
					React.createElement(
						'h2',
						null,
						root.T("SuiteCRMIntegration", "Sugar CRM Integration")
					),
					React.createElement(
						'div',
						{ className: 'suitecrm-top-linkbar' },
						React.createElement(
							'a',
							{ onClick: root.actions.showProjects },
							root.T("Projects", "Projects")
						),
						React.createElement(
							'span',
							null,
							root.T("Users", "Users")
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'panel-body' },
					React.createElement(
						'div',
						{ className: 'suitecrm-sync-data' },
						React.createElement(
							'div',
							{ className: 'message' },
							root.T("PleaseNoteOnlyUsersWithAssociateEmail", "Please note that only users with associated email can be imported to Orchard")
						),
						React.createElement(
							'div',
							{ className: 'sync-project-row header-row' },
							React.createElement(
								'div',
								{ className: 'orchard-project-container' },
								React.createElement(
									'h4',
									{ className: 'current-list' },
									root.T("OrchardCollaborationUsers", "OrchardCollaboration Users")
								)
							),
							React.createElement(
								'div',
								{ className: 'suitecrm-project-container' },
								React.createElement(
									'h4',
									{ className: 'current-list' },
									root.T("SuiteCRMUsers", "Sugar CRM Users")
								),
								syncAllLink
							)
						),
						users
					)
				),
				React.createElement(
					ReactBootstrap.Modal,
					{ show: _self.state.isSyncModalOpen, onHide: _self.closeSyncModal },
					React.createElement(
						ReactBootstrap.Modal.Header,
						{ closeButton: true },
						React.createElement(
							ReactBootstrap.Modal.Title,
							null,
							root.T("SyncData", "Sync Data")
						)
					),
					React.createElement(
						ReactBootstrap.Modal.Body,
						null,
						React.createElement(
							'div',
							{ className: 'sync-modal-body' },
							React.createElement(
								'div',
								{ className: 'error ' + _self.state.modalStateClass },
								_self.state.modalStateError
							),
							React.createElement(
								'div',
								{ className: 'message' },
								root.T("PleaseEnterDefaultPassword", "Please provide the default password for the selected users. They can change password after loging into the system.")
							),
							React.createElement(
								'div',
								{ className: 'data-row' },
								React.createElement(
									'span',
									{ className: 'modal-label' },
									root.T("Password", "Password:")
								),
								React.createElement('input', { type: 'password', ref: 'password' })
							),
							React.createElement(
								'div',
								{ className: 'data-row' },
								React.createElement(
									'span',
									{ className: 'modal-label' },
									root.T("ConfirmPassword", "Confirm Password:")
								),
								React.createElement('input', { type: 'password', ref: 'confirmPassword' })
							)
						)
					),
					React.createElement(
						ReactBootstrap.Modal.Footer,
						null,
						React.createElement(
							ReactBootstrap.Button,
							{ onClick: _self.runSyncing },
							root.T("Sync", "Sync")
						),
						React.createElement(
							ReactBootstrap.Button,
							{ onClick: _self.closeSyncModal },
							root.T("Cancel", "Cancel")
						)
					)
				)
			);
		}
	});
	x.SuiteCRMSyncUsers = SuiteCRMSyncUsers;

	var SuiteCRMDataSync = React.createClass({
		displayName: 'SuiteCRMDataSync',

		copyOrchardProjectToSuiteProject: function (project) {
			this.props.root.actions.copyOrchardProjectToSuiteProject(project);
		},

		closeSyncModel: function () {
			this.state.syncFormData.isOpen = false;
			this.setState(this.state);
		},

		runSyncing: function () {
			this.state.syncFormData.isOpen = false;
			this.setState(this.state);

			var syncFormData = this.state.syncFormData;
			switch (this.state.selectedOperation) {
				case "copySuiteProjectToOrchardProject":
					this.props.root.actions.copySuiteProjectToOrchard(this.state.selectedProject, syncFormData.syncTickets, syncFormData.doNotOverrideNewerValues, syncFormData.syncSubTasks);
					break;
				case "copyOrchardProjectToSuiteProject":
					this.props.root.actions.copyOrchardProjectToSuiteProject(this.state.selectedProject, syncFormData.syncTickets, syncFormData.doNotOverrideNewerValues, syncFormData.syncSubTasks);
					break;
				case "copyAllOrchardProjectToSuiteProject":
					this.props.root.actions.copyAllOrchardProjectToSuiteProject(syncFormData.syncTickets, syncFormData.doNotOverrideNewerValues, syncFormData.syncSubTasks);
					break;
				case "copyAllSuiteProjectToOrchardProject":
					this.props.root.actions.copyAllSuiteProjectToOrchardProject(syncFormData.syncTickets, syncFormData.doNotOverrideNewerValues, syncFormData.syncSubTasks);
					break;
			}
		},

		getInitialState: function () {
			return {
				selectedOperation: null,
				selectedProject: null,
				syncFormData: {
					syncSubTasks: false,
					isOpen: false,
					doNotOverrideNewerValues: true,
					syncTickets: true,
					syncTicketsClass: "hidden"
				}
			};
		},

		showSyncModal: function (project, operation) {
			this.state.selectedProject = project;
			this.state.selectedOperation = operation;
			this.state.syncFormData.isOpen = true;

			if (operation === "copyAllOrchardProjectToSuiteProject" || operation === "copyOrchardProjectToSuiteProject") {
				this.state.syncFormData.syncTicketsClass = "";
			} else {
				this.state.syncFormData.syncTicketsClass = "hidden";
			}

			this.setState(this.state);
		},

		getPager: function (page, count) {
			var _self = this;
			var suiteCRMPager = null;
			var root = _self.props.root;

			var projectsPhrase = root.T("ProjectsCount", " of {0} projects");
			projectsPhrase = projectsPhrase.replace("{0}", count);

			var start = _self.props.model.PageSize * page;
			var end = _self.props.model.Projects.length + start;

			var previousLink = null;
			if (start > 0) {
				previousLink = React.createElement(
					'a',
					{ onClick: root.actions.previousPage },
					root.T("Previous", "Previous")
				);
			} else {
				previousLink = React.createElement('span', null);
			}

			var nextLink = null;
			if (end < count) {
				nextLink = React.createElement(
					'a',
					{ onClick: root.actions.nextPage },
					root.T("Next", "Next")
				);
			} else {
				nextLink = React.createElement('span', null);
			}

			pager = React.createElement(
				'div',
				{ className: 'projects-pager' },
				previousLink,
				React.createElement(
					'span',
					{ className: 'current' },
					start,
					' - ',
					end
				),
				React.createElement(
					'span',
					{ className: 'of-projects' },
					projectsPhrase
				),
				nextLink
			);

			return pager;
		},

		changeSyncFormCheckboxState: function (e) {
			var property = e.target.getAttribute('data-property');
			var value = e.target.checked;

			this.state.syncFormData[property] = value;
			this.setState(this.state);
		},

		render: function () {

			var _self = this;
			var root = _self.props.root;

			if (_self.props.model.ViewUsersPage) {
				return React.createElement('script', null);
			}

			var keyCounter = 1;
			var projects = this.props.model.Projects.map(function (project) {

				var orchardProject = null;

				var syncDateString = "-";
				if (project.LastSyncTime) {
					var date = new Date(project.LastSyncTime);
					syncDateString = formatDate(date);
				}

				if (project.OrchardCollaborationProject != null) {
					orchardProject = React.createElement(
						'div',
						{ className: 'orchard-project-container full' },
						React.createElement(x.Content_SyncProject_Detail, { root: root, shape: project.OrchardProjectShape }),
						React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, project, "copyOrchardProjectToSuiteProject") }),
						React.createElement(
							'div',
							{ className: 'last-sync-time' },
							React.createElement(
								'span',
								{ className: 'date-label' },
								root.T("LastSyncTime", "Last Sync Time"),
								':'
							),
							React.createElement(
								'span',
								{ className: 'date' },
								syncDateString
							)
						)
					);
				} else {
					orchardProject = React.createElement(
						'div',
						{ className: 'orchard-project-container empty' },
						React.createElement(
							'div',
							{ className: 'last-sync-time' },
							root.T("LastSyncTime", "Last Sync Time"),
							':',
							syncDateString
						)
					);
				}

				var suiteCRMProject = null;

				if (project.SuiteCRMProject != null) {
					var date = new Date(project.SuiteCRMProject.ModifiedDateTime != null ? project.SuiteCRMProject.ModifiedDateTime : project.SuiteCRMProject.CreationDateTime);
					var dateString = formatDate(date);
					suiteCRMProject = React.createElement(
						'div',
						{ className: 'suitecrm-project-container full' },
						React.createElement(
							'div',
							null,
							React.createElement(
								'h4',
								null,
								project.SuiteCRMProject.Name
							),
							React.createElement(
								'div',
								{ className: 'modified-date' },
								React.createElement(
									'span',
									{ className: 'date-label' },
									root.T("LastModifiedTime", "Last Modified Time"),
									':'
								),
								React.createElement(
									'span',
									{ className: 'date' },
									dateString
								)
							)
						),
						React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, project, "copySuiteProjectToOrchardProject") })
					);
				} else {
					suiteCRMProject = React.createElement('div', { className: 'suitecrm-project-container empty' });
				}

				var key = "project" + keyCounter;
				keyCounter++;
				return React.createElement(
					'div',
					{ key: key, className: 'sync-project-row data-row' },
					orchardProject,
					suiteCRMProject
				);
			});

			var suiteCRMPager = null;
			var orchardCollaborationPager = null;
			var orchardCollaborationListHeader = null;
			var suiteCRMListHeader = null;

			if (!_self.props.model.ListedBasedOnSuiteCRM) {
				orchardCollaborationPager = _self.getPager(_self.props.model.OrchardCollaborationPage, _self.props.model.OrchardCollaborationProjectsCount);
				suiteCRMPager = React.createElement(
					'div',
					null,
					_self.props.model.SuiteCRMProjectsCount,
					' ',
					root.T("Projects")
				);
				orchardCollaborationListHeader = React.createElement(
					'h4',
					{ className: 'current-list' },
					root.T("OrchardCollaborationProjects", "OrchardCollaboration Projects")
				);
				suiteCRMListHeader = React.createElement(
					'h4',
					null,
					React.createElement(
						'a',
						{ href: '#', onClick: root.actions.switchProjectList },
						root.T("SuiteCRMProjects", "Sugar CRM Projects")
					)
				);
			} else {
				orchardCollaborationPager = React.createElement(
					'div',
					null,
					_self.props.model.OrchardCollaborationProjectsCount,
					' ',
					root.T("Projects")
				);
				suiteCRMPager = _self.getPager(_self.props.model.SuiteCRMPage, _self.props.model.SuiteCRMProjectsCount);
				orchardCollaborationListHeader = React.createElement(
					'h4',
					null,
					React.createElement(
						'a',
						{ href: '#', onClick: root.actions.switchProjectList },
						root.T("OrchardCollaborationProjects", "OrchardCollaboration Projects")
					)
				);
				suiteCRMListHeader = React.createElement(
					'h4',
					{ className: 'current-list' },
					root.T("SuiteCRMProjects", "Sugar CRM Projects")
				);
			}

			return React.createElement(
				'article',
				{ className: 'panel panel-default modal-container' },
				React.createElement(
					'div',
					{ className: 'panel-heading' },
					React.createElement(
						'h2',
						null,
						root.T("SuiteCRMIntegration", "Sugar CRM Integration")
					),
					React.createElement(
						'div',
						{ className: 'suitecrm-top-linkbar' },
						React.createElement(
							'span',
							null,
							root.T("Projects", "Projects")
						),
						React.createElement(
							'a',
							{ onClick: root.actions.showUsers },
							root.T("Users", "Users")
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'panel-body' },
					React.createElement(
						'div',
						{ className: 'suitecrm-sync-data' },
						React.createElement(
							'div',
							{ className: 'sync-project-row header-row' },
							React.createElement(
								'div',
								{ className: 'orchard-project-container' },
								orchardCollaborationListHeader,
								orchardCollaborationPager,
								React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, null, "copyAllOrchardProjectToSuiteProject") })
							),
							React.createElement(
								'div',
								{ className: 'suitecrm-project-container' },
								suiteCRMListHeader,
								suiteCRMPager,
								React.createElement('a', { className: 'sync', title: root.T("sync"), onClick: _self.showSyncModal.bind(null, null, "copyAllSuiteProjectToOrchardProject") })
							)
						),
						projects
					)
				),
				React.createElement(
					ReactBootstrap.Modal,
					{ show: _self.state.syncFormData.isOpen, onHide: _self.closeSyncModel },
					React.createElement(
						ReactBootstrap.Modal.Header,
						{ closeButton: true },
						React.createElement(
							ReactBootstrap.Modal.Title,
							null,
							root.T("SyncData", "Sync Data")
						)
					),
					React.createElement(
						ReactBootstrap.Modal.Body,
						null,
						React.createElement(
							'div',
							{ className: 'sync-modal-body' },
							React.createElement(
								'div',
								null,
								React.createElement('input', { type: 'checkbox', onChange: _self.changeSyncFormCheckboxState, 'data-property': 'syncTickets', defaultChecked: _self.state.syncFormData.syncTickets, value: 'true' }),
								React.createElement(
									'span',
									{ className: 'checkbox-label' },
									root.T("SyncTickets", "Sync Tickets")
								)
							),
							React.createElement(
								'div',
								null,
								React.createElement('input', { type: 'checkbox', onChange: _self.changeSyncFormCheckboxState, 'data-property': 'doNotOverrideNewerValues', defaultChecked: _self.state.syncFormData.doNotOverrideNewerValues, value: 'true' }),
								React.createElement(
									'span',
									{ className: 'checkbox-label' },
									root.T("DoNotOverrideNewerValues", "Don't override newer version")
								)
							),
							React.createElement(
								'div',
								{ className: _self.state.syncFormData.syncTicketsClass },
								React.createElement('input', { type: 'checkbox', onChange: _self.changeSyncFormCheckboxState, 'data-property': 'syncSubTasks', defaultChecked: _self.state.syncFormData.syncSubTasks, value: 'true' }),
								React.createElement(
									'span',
									{ className: 'checkbox-label' },
									root.T("SyncSubTasks", "Sync Sub Tasks")
								)
							)
						)
					),
					React.createElement(
						ReactBootstrap.Modal.Footer,
						null,
						React.createElement(
							ReactBootstrap.Button,
							{ onClick: _self.runSyncing },
							root.T("Sync", "Sync")
						),
						React.createElement(
							ReactBootstrap.Button,
							{ onClick: _self.closeSyncModel },
							root.T("Cancel", "Cancel")
						)
					)
				)
			);
		}
	});

	orchardcollaboration.react.allComponents.SuiteCRMDataSync = SuiteCRMDataSync;
})();