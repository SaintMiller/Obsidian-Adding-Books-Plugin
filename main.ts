import { BookTemplate } from 'Book';
import { ExtractorFB2 } from 'Utility/ExtractorFB2';
import { ExtractorPDF } from 'Utility/ExtractorPDF';
import { Utility } from 'Utility/UtilityFunction';
import { App, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
	bookShellFolderPath: string;
	bookNotesFolderPath: string;
	bookNoteTemplatePath: string;
	bookData: BookTemplate;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	bookShellFolderPath: '',
	bookNotesFolderPath: '',
	bookNoteTemplatePath: '',
	bookData: new BookTemplate(),
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			'package-search', 
			'Add book into bookshelf', 
			(evt: MouseEvent) => {
				new SampleModal(this.app, this.settings).open();
				
				// added element for options into ribon
				const menu = new Menu();

				menu.showAtMouseEvent(evt);
			});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	settingsData: MyPluginSettings;
	bookData: BookTemplate;

	constructor(app: App, settingsData: MyPluginSettings) {
		super(app);
		this.settingsData = settingsData;
		this.bookData = new BookTemplate();
		settingsData.bookData = this.bookData;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1",{text:'Drop your file into this window'});

		this.createFiels(contentEl);

		contentEl.createEl("div", {});
		contentEl.createEl('button', { text: 'Create a new note' })
		.addEventListener('click', async () => {
			const res = await Utility.copyFileWithReplacements(
				this.app,
				this.settingsData.bookNoteTemplatePath,
				this.settingsData.bookNotesFolderPath,
				this.bookData);
			new Notice(`File will be saved?\t${res}!`);
			this.close();
		});

		// Створіть обробник події для перетягування файлу
		contentEl.addEventListener('dragover', (event) => {
			event.preventDefault();
			event.stopPropagation();
		});

		contentEl.addEventListener('drop', async (event) => {
			event.preventDefault();
			event.stopPropagation();

			const files = event.dataTransfer?.files;
			if (!files) {
				return;
			}
			new Notice( (files.length).toString());
			if (files.length > 0) {
				const file = files[0];
				const extension = Utility.getFileExtension(file.name).toLowerCase();
				
				let extractor;
				if (extension == "pdf"){
					extractor = new ExtractorPDF();
				} else if (extension == "fb2"){
					extractor = new ExtractorFB2();
				} else {
					new Notice("Error with extension");
					return;
				}

				const fileContents = await extractor.readFileContents(file) as BookTemplate;
				new Notice("File name: " + file.name);
				new Notice("File contents: "+ fileContents.title);
			}
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	private createFiels(contentEl: HTMLElement) {
		let booknameHeader: HTMLHeadingElement;
		const bookdata = this.bookData;

		function updateOtherElements() {
			booknameHeader.setText('Future book`s name:' + Utility.prepareFilename(bookdata));
		}
		
		const columnsContainer = contentEl.createEl('div', {cls: 'two-columns-container'});

		// add element into first column
		const column1 = columnsContainer.createEl('div', {cls: 'column'});
		this.AddSetting(column1,
			'Title',
			'A book`s name',
			undefined,
			undefined,
			(value: string) => {
				this.bookData.title = value;
				updateOtherElements(); 
			}
		)
		this.AddSetting(column1,
			'Author/s',
			undefined,
			'Separate by ,',
			undefined,
			async (value: string) => {
				this.bookData.author = value.split(',');
				updateOtherElements(); 
			}
		)

		this.AddSetting(column1,
			'ISBN',
			undefined,
			'ISBN10 or ISBN13',
			undefined,
			async (value: string) => {
				const number = Utility.calcDigitInString(value);
				if (number == 10){
					this.bookData.isbn10 = value;
				} else {
					this.bookData.isbn13 = value;
				}
			}
		)
		
		new Setting(column1)
			.setName('Status')
			.setDesc('ead,\nunread,\nwant to read,\ndon`t want to read')
			.addDropdown((dropdown) => {
				this.bookData.status = 'unread'; // option2
				dropdown
					.addOptions({
						'read': 'read',
						'unread': 'unread',
						'want to read': 'want to read',
						'don`t want to read': 'don`t want to read',
					})
					.setValue(this.bookData.status) 
					.onChange((value) => {
						this.bookData.status = value;
					});
			});
		
		// -- separate ---
		
		// add element into first column
		const column2 = columnsContainer.createEl('div', {cls: 'column'});
		
		this.AddSetting(column2,
			'Publisher',
			undefined,
			'Who print this book?',
			undefined,
			async (value: string) => {
				this.bookData.publisher = value;
			}
		)
		this.AddSetting(column2,
			'Publish',
			'When publish book',
			'set year here',
			undefined,
			async (value: string) => {
				this.bookData.publishDate = value;
			}
		)

		this.AddSetting(column2,
			'Total pages',
			undefined,
			'',
			undefined,
			async (value: string) => {
				this.bookData.totalPage = value;
			}
		)

		this.AddSetting(column2,
			'Cover URL',
			undefined,
			'For cool picture',
			undefined,
			async (value: string) => {
				this.bookData.coverUrl = value;
			}
		)

		this.AddSetting(column2,
			'Tags',
			undefined,
			'Separate by ,',
			undefined,
			async (value: string) => {
				this.bookData.tags = value.split(',');
			}
		)

		// -- separate ---
		booknameHeader = contentEl.createEl('h4', { text: 'Future book`s name: '});
	}

	private AddSetting(
		contentEl: HTMLElement, 
		Name: string, 
		Desc: string = '',
		PlaceHolder: string = '',
		Value: string = '',
		callback: (value: string) => any) {
		new Setting(contentEl)
			.setName(Name)
			.setDesc(Desc)
			.addText(text => text
				.setPlaceholder(PlaceHolder)
				.setValue(Value)
				.onChange(callback));
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl("div", { text: "Settings" });

		new Setting(containerEl)
			.setName('Path to bookshell folder')
			.setDesc("Where you have digital books. Disabled saved function if the folder isn\'t created")
			.addText(text => 
				text
				.setPlaceholder('Put folder path')
				.setValue(this.plugin.settings.bookShellFolderPath)
				.onChange(async (value) => {
					if (Utility.doesDirectoryExist(value)){
						this.plugin.settings.bookShellFolderPath = value;
						await this.plugin.saveSettings();
						new Notice(`Folder found!\nYou can save files\ninto this folder`);
					} else {
						new Notice(`Folder not found!`);
					}
				}).inputEl.style.width = '400px');

		new Setting(this.containerEl)
			.setName('Path to notes bookshell folder')
			.setDesc('Where you save notes about books')
			.addSearch((search) => {
				search.inputEl.style.width = '400px';
				search
					.setPlaceholder('Need to choose your folder...')
					.setValue(this.plugin.settings.bookNotesFolderPath)
					.onChange((query) => {
						const dropdownContainer = document.getElementById("bookNotesFolder-dropdown-container");
						if (dropdownContainer == null ) {
							return;
						}
						dropdownContainer.innerHTML = '';

						const allFolders = Utility.getFolders(this.app, query);
						const names = allFolders.map((folder) => folder.path)
						names.forEach((suggestion) => {
							const suggestionItem = document.createElement('div');
							suggestionItem.textContent = suggestion;
							suggestionItem.addEventListener('click', async () => {
								search.setValue(suggestion);
								dropdownContainer.style.display = 'none';
								new Notice(`You choose folder:\n${suggestion} folder`)

								this.plugin.settings.bookNotesFolderPath = suggestion;
								await this.plugin.saveSettings();
							});

							dropdownContainer.appendChild(suggestionItem);
						});

						if (names.length > 0) {
							dropdownContainer.style.display = 'block';
						} else {
							dropdownContainer.style.display = 'none';
						}

						search.inputEl.addEventListener('focus', () => {
							dropdownContainer.style.display = 'block';
						});
						
						search.inputEl.addEventListener('blur', () => {
							function command(){
								dropdownContainer.style.display = 'none';
							}
							setTimeout(command, 300);
						});
						
					});
			});

		const dropdownContainer = document.createElement('div');
		dropdownContainer.id = 'bookNotesFolder-dropdown-container';
		dropdownContainer.classList.add('dropdown-container');
		dropdownContainer.style.display = 'none'; 

		const dropdownList = document.createElement('ul');
		dropdownList.id = 'dropdown-list';
		dropdownContainer.appendChild(dropdownList);

		this.containerEl.appendChild(dropdownContainer);	

		// if you read these code and got facepalm -- I am sorry.
		new Setting(this.containerEl)
			.setName('Path to template notes')
			.setDesc('Template for your future notes')
			.addSearch((search) => {
				search.inputEl.style.width = '400px';
				search
					.setPlaceholder('Need to choose your folder...')
					.setValue(this.plugin.settings.bookNoteTemplatePath)
					.onChange((query) => {
						const templateNotedropdownContainer = document.getElementById("templateNote-dropdown-container");
						if (templateNotedropdownContainer == null) {
							return;
						}
						templateNotedropdownContainer.innerHTML = '';

						const allFoldersFiles = Utility.getFoldersAndFilesInFolder(this.app, query);
						allFoldersFiles.forEach((suggestion) => {
							const suggestionItem = document.createElement('div');
							suggestionItem.textContent = suggestion;

							suggestionItem.addEventListener('click', async () => {
								search.setValue(suggestion);
								if (Utility.isObsidianFilePath(suggestion)){
									templateNotedropdownContainer.style.display = 'none';
									new Notice(`You choose template file :\n${suggestion}`)

									this.plugin.settings.bookNoteTemplatePath = suggestion;
									await this.plugin.saveSettings();
								} else {
									new Notice(`Is not a file\n${suggestion}`)
								}
								
							});

							templateNotedropdownContainer.appendChild(suggestionItem);
						});

						if (allFoldersFiles.length > 0) {
							templateNotedropdownContainer.style.display = 'block';
						} else {
							templateNotedropdownContainer.style.display = 'none';
						}

						search.inputEl.addEventListener('focus', () => {
							templateNotedropdownContainer.style.display = 'block';
						});

						search.inputEl.addEventListener('blur', () => {
							function command() {
								templateNotedropdownContainer.style.display = 'none';
							}
							setTimeout(command, 300);
						});

					});
			});

		const templateNotedropdownContainer = document.createElement('div');
		templateNotedropdownContainer.id = 'templateNote-dropdown-container';
		templateNotedropdownContainer.classList.add('dropdown-container');
		templateNotedropdownContainer.style.display = 'none';

		const templateNoteddropdownList = document.createElement('ul');
		templateNoteddropdownList.id = 'dropdown-list';
		templateNotedropdownContainer.appendChild(templateNoteddropdownList);

		this.containerEl.appendChild(templateNotedropdownContainer);
	}
}
